const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cron = require('node-cron');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const SECRET = process.env.JWT_SECRET || 'InternHub_SharedSecret_2024';
const User = require('./models/User');

// ── Schemas ────────────────────────────────────────────
const taskSchema = new mongoose.Schema({
  title:String, description:String,
  assignedTo:{ type:mongoose.Schema.Types.ObjectId, ref:'User' },
  assignedBy:{ type:mongoose.Schema.Types.ObjectId, ref:'User' },
  deadline:Date, priority:{ type:String, default:'medium' },
  status:{ type:String, default:'pending' },
  isRecurring:{ type:Boolean, default:false },
  recurringId:{ type:mongoose.Schema.Types.ObjectId },
  reminderSent24h:{ type:Boolean, default:false },
  reminderSent1h: { type:Boolean, default:false },
}, { timestamps:true });
const Task = mongoose.model('AutoTask', taskSchema);

const automationSchema = new mongoose.Schema({
  name:String, description:String,
  cronExpression:String, scheduleLabel:String,
  taskTemplate:{ title:String, description:String, priority:String, daysToDeadline:Number },
  assignTo:[{ type:mongoose.Schema.Types.ObjectId, ref:'User' }],
  createdBy:{ type:mongoose.Schema.Types.ObjectId, ref:'User' },
  isActive:{ type:Boolean, default:true },
  lastRun:Date, runCount:{ type:Number, default:0 },
}, { timestamps:true });
const Automation = mongoose.model('Automation', automationSchema);

const notifSchema = new mongoose.Schema({
  user:{ type:mongoose.Schema.Types.ObjectId, ref:'User' },
  title:String, message:String,
  type:{ type:String, default:'info' },
  read:{ type:Boolean, default:false },
}, { timestamps:true });
const Notification = mongoose.model('Notification', notifSchema);

// ── Email ──────────────────────────────────────────────
const sendEmail = async (to, subject, html) => {
  if (!process.env.EMAIL_USER) return;
  try {
    const t = nodemailer.createTransport({ service:'gmail', auth:{ user:process.env.EMAIL_USER, pass:process.env.EMAIL_PASS } });
    await t.sendMail({ from:process.env.EMAIL_USER, to, subject, html });
  } catch(e) { console.log('Email skipped:', e.message); }
};

// ── Auth ───────────────────────────────────────────────
const auth = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message:'Unauthorized' });
  try { req.user = await User.findById(jwt.verify(token, SECRET).id).select('-password'); next(); }
  catch { res.status(401).json({ message:'Invalid token' }); }
};
const adminOnly = (req,res,next) => { if(req.user?.role!=='admin') return res.status(403).json({message:'Admin only'}); next(); };

app.post('/api/auth/login', async (req,res) => {
  try {
    const user = await User.findOne({ email:req.body.email });
    if (!user || !(await user.matchPassword(req.body.password)))
      return res.status(401).json({ message:'Invalid credentials' });
    res.json({ token:jwt.sign({id:user._id},SECRET,{expiresIn:'7d'}), user:{id:user._id,name:user.name,email:user.email,role:user.role,internshipType:user.internshipType} });
  } catch(e){ res.status(500).json({message:e.message}); }
});
app.get('/api/auth/me', auth, (req,res) => res.json(req.user));

// ── Tasks ──────────────────────────────────────────────
app.get('/api/tasks', auth, async (req,res) => {
  const filter = req.user.role==='admin' ? {} : { assignedTo:req.user._id };
  const tasks = await Task.find(filter).populate('assignedTo','name email internshipType').populate('assignedBy','name').sort({createdAt:-1});
  res.json(tasks);
});
app.post('/api/tasks', auth, adminOnly, async (req,res) => {
  const task = await Task.create({...req.body, assignedBy:req.user._id});
  const assignee = await User.findById(req.body.assignedTo);
  if (assignee) {
    await Notification.create({ user:assignee._id, title:'New Task', message:`Task assigned: ${task.title}`, type:'task' });
    sendEmail(assignee.email, `New Task: ${task.title}`, `<h2>Hi ${assignee.name},</h2><p>New task: <strong>${task.title}</strong></p><p>Deadline: ${new Date(task.deadline).toLocaleDateString()}</p>`);
  }
  res.status(201).json(task);
});
app.put('/api/tasks/:id', auth, async (req,res) => {
  const task = await Task.findByIdAndUpdate(req.params.id, req.body, {new:true});
  res.json(task);
});
app.delete('/api/tasks/:id', auth, adminOnly, async (req,res) => {
  await Task.findByIdAndDelete(req.params.id); res.json({message:'Deleted'});
});

// ── Users (for admin dropdown) ─────────────────────────
app.get('/api/users', auth, adminOnly, async (req,res) => {
  const users = await User.find({role:'intern'}).select('-password');
  res.json(users);
});

// ── Automations ────────────────────────────────────────
const scheduledJobs = {};
const scheduleAuto = (auto) => {
  if (scheduledJobs[auto._id]) try { scheduledJobs[auto._id].stop(); } catch(e){}
  if (!auto.isActive) return;
  try {
    scheduledJobs[auto._id] = cron.schedule(auto.cronExpression, async () => {
      for (const userId of auto.assignTo) {
        const deadline = new Date();
        deadline.setDate(deadline.getDate() + (auto.taskTemplate.daysToDeadline||1));
        const task = await Task.create({ title:auto.taskTemplate.title, description:auto.taskTemplate.description, assignedTo:userId, assignedBy:auto.createdBy, deadline, priority:auto.taskTemplate.priority||'medium', isRecurring:true, recurringId:auto._id });
        const user = await User.findById(userId);
        if (user) {
          await Notification.create({ user:userId, title:'Auto Task', message:`Recurring: ${task.title}`, type:'automation' });
          sendEmail(user.email, `[Auto] ${task.title}`, `<h2>Hi ${user.name},</h2><p>Recurring task: ${task.title}</p>`);
        }
      }
      await Automation.findByIdAndUpdate(auto._id, { lastRun:new Date(), $inc:{runCount:1} });
    });
  } catch(e) { console.error('Cron error:', e.message); }
};

app.get('/api/automations', auth, adminOnly, async (req,res) => {
  const autos = await Automation.find().populate('assignTo','name').populate('createdBy','name');
  res.json(autos);
});
app.post('/api/automations', auth, adminOnly, async (req,res) => {
  const auto = await Automation.create({...req.body, createdBy:req.user._id});
  scheduleAuto(auto); res.status(201).json(auto);
});
app.put('/api/automations/:id', auth, adminOnly, async (req,res) => {
  const auto = await Automation.findByIdAndUpdate(req.params.id,req.body,{new:true});
  scheduleAuto(auto); res.json(auto);
});
app.delete('/api/automations/:id', auth, adminOnly, async (req,res) => {
  if(scheduledJobs[req.params.id]) scheduledJobs[req.params.id].stop();
  await Automation.findByIdAndDelete(req.params.id); res.json({message:'Deleted'});
});
app.post('/api/automations/:id/run', auth, adminOnly, async (req,res) => {
  const auto = await Automation.findById(req.params.id);
  let created = 0;
  for (const userId of auto.assignTo) {
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + (auto.taskTemplate.daysToDeadline||1));
    await Task.create({ title:auto.taskTemplate.title, description:auto.taskTemplate.description, assignedTo:userId, assignedBy:req.user._id, deadline, priority:auto.taskTemplate.priority||'medium', isRecurring:true });
    created++;
  }
  await Automation.findByIdAndUpdate(auto._id, { lastRun:new Date(), $inc:{runCount:1} });
  res.json({ message:`Created ${created} tasks` });
});

// ── Notifications ──────────────────────────────────────
app.get('/api/notifications', auth, async (req,res) => {
  const notifs = await Notification.find({user:req.user._id}).sort({createdAt:-1}).limit(50);
  res.json(notifs);
});
app.put('/api/notifications/read-all', auth, async (req,res) => {
  await Notification.updateMany({user:req.user._id, read:false},{read:true});
  res.json({message:'All read'});
});

// ── Hourly deadline reminder ───────────────────────────
cron.schedule('0 * * * *', async () => {
  const now = new Date();
  const in24h = new Date(now.getTime() + 24*60*60*1000);
  const tasks24 = await Task.find({ status:{$in:['pending','in-progress']}, deadline:{$gte:now,$lte:in24h}, reminderSent24h:false }).populate('assignedTo','name email');
  for (const t of tasks24) {
    if (t.assignedTo?.email) {
      sendEmail(t.assignedTo.email, `⏰ Reminder: "${t.title}" due in 24h`, `<h2>Task due soon!</h2><p>${t.title} is due in 24 hours.</p>`);
      await Notification.create({ user:t.assignedTo._id, title:'24h Reminder', message:`"${t.title}" due tomorrow!`, type:'reminder' });
      await Task.findByIdAndUpdate(t._id, { reminderSent24h:true });
    }
  }
});

const seedAdmin = async () => {
  try {
    const exists = await User.findOne({ email:'admin@internhub.com' });
    if (!exists) await User.create({ name:'Admin', email:'admin@internhub.com', password:'Admin@2024', role:'admin' });
  } catch(e) {}
};

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/intern_management')
  .then(async () => {
    await seedAdmin();
    const autos = await Automation.find({ isActive:true });
    autos.forEach(scheduleAuto);
    app.listen(process.env.PORT || 5007, () => console.log('🚀 Automation API :5004'));
  });
