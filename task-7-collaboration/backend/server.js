const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
  pingTimeout: 60000,
  pingInterval: 25000,
});

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const SECRET = process.env.JWT_SECRET || 'InternHub_SharedSecret_2024';
const User = require('./models/User');

// ── Schemas (unchanged) ────────────────────────────────────
const projectSchema = new mongoose.Schema({
  name: String,
  description: String,
  color: { type: String, default: '#C8A96E' },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  internshipType: { type: String, default: '' },
  columns: { type: [String], default: ['To Do', 'In Progress', 'Review', 'Done'] },
}, { timestamps: true });
const Project = mongoose.model('CollabProject', projectSchema);

const cardSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'CollabProject' },
  title: String,
  description: String,
  column: { type: String, default: 'To Do' },
  assignees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  dueDate: Date,
  priority: { type: String, default: 'medium' },
  labels: [{ text: String, color: String }],
  order: { type: Number, default: 0 },
  submission: {
    githubLink: { type: String, default: '' },
    notes: { type: String, default: '' },
    attachments: { type: Array, default: [] },
    submittedAt: Date,
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
}, { timestamps: true });
const Card = mongoose.model('CollabCard', cardSchema);

const commentSchema = new mongoose.Schema({
  card: { type: mongoose.Schema.Types.ObjectId, ref: 'CollabCard' },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  text: String,
  attachment: { name: String, data: String, type: String },
}, { timestamps: true });
const Comment = mongoose.model('CollabComment', commentSchema);

const milestoneSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'CollabProject' },
  title: String,
  description: String,
  dueDate: Date,
  status: { type: String, default: 'upcoming' },
  progress: { type: Number, default: 0 },
}, { timestamps: true });
const Milestone = mongoose.model('Milestone', milestoneSchema);

const activitySchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'CollabProject' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: String,
  entityName: String,
  meta: { type: Object, default: {} },
}, { timestamps: true });
const Activity = mongoose.model('CollabActivity', activitySchema);

// ── Middleware ─────────────────────────────────────────────────────
const auth = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try {
    req.user = await User.findById(jwt.verify(token, SECRET).id).select('-password');
    if (!req.user) return res.status(401).json({ message: 'User not found' });
    next();
  } catch { res.status(401).json({ message: 'Invalid token' }); }
};

const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
  next();
};

const projectMember = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.pid);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    const isOwner = project.owner.equals(req.user._id);
    const isMember = project.members.some(m => m.equals(req.user._id));
    if (!isOwner && !isMember) return res.status(403).json({ message: 'Not a member of this project' });
    req.project = project;
    next();
  } catch (e) { res.status(500).json({ message: e.message }); }
};

const logActivity = async (projectId, userId, action, entityName, meta = {}) => {
  try {
    const a = await Activity.create({ project: projectId, user: userId, action, entityName, meta });
    const pop = await Activity.findById(a._id).populate('user', 'name color role');
    io.to(`project:${projectId}`).emit('activity', pop);
    return pop;
  } catch (e) { console.error('logActivity error:', e.message); }
};

// ── Auth ────────────────────────────────────────────────────────────
app.post('/api/auth/login', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user || !(await user.matchPassword(req.body.password)))
      return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id }, SECRET, { expiresIn: '7d' });
    res.json({
      token,
      user: {
        id: user._id, name: user.name, email: user.email,
        role: user.role, color: user.color, internshipType: user.internshipType
      }
    });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

app.get('/api/auth/me', auth, (req, res) => res.json(req.user));

app.get('/api/users', auth, adminOnly, async (req, res) => {
  const users = await User.find().select('-password');
  res.json(users);
});

// ── Projects (unchanged) ─────────────────────────────────────────────
app.get('/api/projects', auth, async (req, res) => {
  try {
    const query = req.user.role === 'admin'
      ? { owner: req.user._id }
      : { members: req.user._id };
    const projects = await Project.find(query)
      .populate('owner', 'name color role')
      .populate('members', 'name color role internshipType');
    res.json(projects);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

app.post('/api/projects', auth, adminOnly, async (req, res) => {
  try {
    if (req.body.members?.length) {
      const interns = await User.find({ _id: { $in: req.body.members }, role: 'intern' });
      if (interns.length !== req.body.members.length)
        return res.status(400).json({ message: 'All members must be interns.' });
    }
    const project = await Project.create({
      name: req.body.name,
      description: req.body.description,
      color: req.body.color,
      internshipType: req.body.internshipType,
      owner: req.user._id,
      members: req.body.members || [],
    });
    const populated = await project.populate([
      { path: 'owner', select: 'name color role' },
      { path: 'members', select: 'name color role internshipType' },
    ]);
    res.status(201).json(populated);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

app.put('/api/projects/:id', auth, adminOnly, async (req, res) => {
  try {
    if (req.body.members) {
      const interns = await User.find({ _id: { $in: req.body.members }, role: 'intern' });
      req.body.members = interns.map(i => i._id);
    }
    const p = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('owner', 'name color role')
      .populate('members', 'name color role internshipType');
    res.json(p);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

app.delete('/api/projects/:id', auth, adminOnly, async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    const cardIds = await Card.find({ project: req.params.id }).distinct('_id');
    await Card.deleteMany({ project: req.params.id });
    await Milestone.deleteMany({ project: req.params.id });
    await Activity.deleteMany({ project: req.params.id });
    await Comment.deleteMany({ card: { $in: cardIds } });
    res.json({ message: 'Deleted' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

app.get('/api/projects/:pid/collaborators', auth, projectMember, async (req, res) => {
  try {
    const filter = {
      role: 'intern',
      ...(req.project.internshipType ? { internshipType: req.project.internshipType } : {}),
    };
    const users = await User.find(filter).select('-password');
    res.json(users);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ── Cards ─────────────────────────────────────────────────────────────
// ✅ FIX: Interns only see tasks they are assigned to
app.get('/api/projects/:pid/cards', auth, projectMember, async (req, res) => {
  try {
    const filter = { project: req.params.pid };
    if (req.user.role !== 'admin') {
      filter.assignees = req.user._id;
    }
    const cards = await Card.find(filter)
      .populate('assignees', 'name color role')
      .populate('submission.submittedBy', 'name color')
      .sort({ order: 1 });
    res.json(cards);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

app.post('/api/projects/:pid/cards', auth, projectMember, adminOnly, async (req, res) => {
  try {
    if (req.body.assignees?.length) {
      const interns = await User.find({ _id: { $in: req.body.assignees }, role: 'intern' });
      req.body.assignees = interns.map(i => i._id);
    }
    const count = await Card.countDocuments({ project: req.params.pid });
    const card = await Card.create({ ...req.body, project: req.params.pid, order: count });
    const pop = await Card.findById(card._id)
      .populate('assignees', 'name color role')
      .populate('submission.submittedBy', 'name color');
    io.to(`project:${req.params.pid}`).emit('card-created', pop);
    await logActivity(req.params.pid, req.user._id, 'created task', card.title);
    res.status(201).json(pop);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ✅ FIX: Interns can only update cards they are assigned to
app.put('/api/projects/:pid/cards/:id', auth, projectMember, async (req, res) => {
  try {
    const card = await Card.findById(req.params.id);
    if (!card) return res.status(404).json({ message: 'Card not found' });

    // Interns can only modify cards they are assigned to
    if (req.user.role !== 'admin') {
      const isAssigned = card.assignees.some(a => a.equals(req.user._id));
      if (!isAssigned) return res.status(403).json({ message: 'You can only modify your assigned tasks.' });
    }

    let updateData = {};

    if (req.user.role === 'admin') {
      const to = req.body.column;
      if (to && card.column === 'Done') return res.status(403).json({ message: 'Done tasks cannot be moved.' });
      if (to && card.column === 'Review' && to !== 'Done') return res.status(403).json({ message: 'Review tasks can only go to Done.' });
      updateData = { ...req.body };
      if (updateData.assignees?.length) {
        const interns = await User.find({ _id: { $in: updateData.assignees }, role: 'intern' });
        updateData.assignees = interns.map(i => i._id);
      }
    } else {
      if (!req.body.column && !req.body.submission) return res.status(403).json({ message: 'Interns can only move tasks or submit work.' });
      if (req.body.column) {
        const from = card.column;
        const to = req.body.column;
        if (from === 'Review' || from === 'Done') return res.status(403).json({ message: `"${from}" column cannot be moved by interns.` });
        if (to === 'Done' || to === 'Review') return res.status(403).json({ message: 'Interns cannot move tasks to Done or Review directly.' });
        const ALLOWED = { 'To Do': ['In Progress'], 'In Progress': ['To Do'] };
        if (!ALLOWED[from]?.includes(to)) return res.status(403).json({ message: `Cannot move from "${from}" to "${to}".` });
        updateData.column = to;
      }
      if (req.body.submission) {
        if (card.column !== 'In Progress') return res.status(403).json({ message: 'You can only submit tasks that are in progress.' });
        updateData.submission = {
          githubLink: req.body.submission.githubLink || '',
          notes: req.body.submission.notes || '',
          attachments: req.body.submission.attachments || [],
          submittedAt: new Date(),
          submittedBy: req.user._id,
        };
        updateData.column = 'Review';
      }
    }

    const updated = await Card.findByIdAndUpdate(req.params.id, updateData, { new: true })
      .populate('assignees', 'name color role')
      .populate('submission.submittedBy', 'name color');
    io.to(`project:${req.params.pid}`).emit('card-updated', updated);

    if (updateData.column && updateData.column !== card.column) {
      const actionMap = {
        'Review': 'submitted for review',
        'Done':   'marked as done ✅',
        'In Progress': 'moved to In Progress',
        'To Do':  'moved back to To Do',
      };
      const action = actionMap[updateData.column] || `moved to ${updateData.column}`;
      await logActivity(req.params.pid, req.user._id, action, card.title);
    } else if (req.user.role === 'admin' && !updateData.column) {
      await logActivity(req.params.pid, req.user._id, 'updated task', card.title);
    }
    res.json(updated);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

app.delete('/api/projects/:pid/cards/:id', auth, projectMember, adminOnly, async (req, res) => {
  try {
    const card = await Card.findById(req.params.id);
    if (!card) return res.status(404).json({ message: 'Card not found' });
    if (card.column !== 'To Do') return res.status(403).json({ message: 'Only tasks in "To Do" can be deleted.' });
    await Card.findByIdAndDelete(req.params.id);
    await Comment.deleteMany({ card: req.params.id });
    io.to(`project:${req.params.pid}`).emit('card-deleted', req.params.id);
    await logActivity(req.params.pid, req.user._id, 'deleted task', card.title);
    res.json({ message: 'Deleted' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ── Comments (unchanged) ───────────────────────────────────────────────
const checkCardAccess = async (cardId, userId) => {
  const card = await Card.findById(cardId);
  if (!card) return { error: 'Card not found', status: 404 };
  const project = await Project.findById(card.project);
  if (!project) return { error: 'Project not found', status: 404 };
  const isOwner = project.owner.equals(userId);
  const isMember = project.members.some(m => m.equals(userId));
  if (!isOwner && !isMember) return { error: 'Not authorized', status: 403 };
  return { card, project };
};

app.get('/api/cards/:cid/comments', auth, async (req, res) => {
  try {
    const access = await checkCardAccess(req.params.cid, req.user._id);
    if (access.error) return res.status(access.status).json({ message: access.error });
    const comments = await Comment.find({ card: req.params.cid })
      .populate('author', 'name color role')
      .sort({ createdAt: 1 });
    res.json(comments);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

app.post('/api/cards/:cid/comments', auth, async (req, res) => {
  try {
    const access = await checkCardAccess(req.params.cid, req.user._id);
    if (access.error) return res.status(access.status).json({ message: access.error });
    const comment = await Comment.create({
      card: req.params.cid,
      author: req.user._id,
      text: req.body.text,
      attachment: req.body.attachment || undefined,
    });
    const pop = await comment.populate('author', 'name color role');
    io.to(`card:${req.params.cid}`).emit('new-comment', pop);
    io.to(`project:${access.card.project}`).emit('new-comment-notify', {
      cardId: req.params.cid,
      cardTitle: access.card.title,
      author: { name: req.user.name, color: req.user.color },
    });
    res.status(201).json(pop);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ── Milestones (unchanged) ──────────────────────────────────────────────
app.get('/api/projects/:pid/milestones', auth, projectMember, async (req, res) => {
  try {
    const ms = await Milestone.find({ project: req.params.pid }).sort({ dueDate: 1 });
    res.json(ms);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

app.post('/api/projects/:pid/milestones', auth, projectMember, adminOnly, async (req, res) => {
  try {
    const ms = await Milestone.create({ ...req.body, project: req.params.pid });
    io.to(`project:${req.params.pid}`).emit('milestone-created', ms);
    res.status(201).json(ms);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

app.put('/api/milestones/:id', auth, async (req, res) => {
  try {
    const ms = await Milestone.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(ms);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ── Activity (unchanged) ────────────────────────────────────────────────
app.get('/api/projects/:pid/activity', auth, projectMember, async (req, res) => {
  try {
    const acts = await Activity.find({ project: req.params.pid })
      .populate('user', 'name color role')
      .sort({ createdAt: -1 })
      .limit(30);
    res.json(acts);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ── Socket.IO setup (unchanged) ─────────────────────────────────────────
const onlineUsers = {};

io.use(async (socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('Unauthorized'));
  try {
    socket.user = await User.findById(jwt.verify(token, SECRET).id).select('-password');
    if (!socket.user) return next(new Error('User not found'));
    next();
  } catch { next(new Error('Invalid token')); }
});

io.on('connection', (socket) => {
  console.log(`🔌 ${socket.user.name} connected`);

  socket.on('join-project', (pid) => {
    socket.join(`project:${pid}`);
    socket.currentProject = pid;

    if (!onlineUsers[pid]) onlineUsers[pid] = [];
    onlineUsers[pid] = onlineUsers[pid].filter(u => u.id !== socket.user._id.toString());
    onlineUsers[pid].push({
      id: socket.user._id.toString(),
      name: socket.user.name,
      color: socket.user.color,
      role: socket.user.role,
      socketId: socket.id,
    });
    io.to(`project:${pid}`).emit('presence-update', onlineUsers[pid]);
  });

  socket.on('join-card', (cid) => {
    socket.join(`card:${cid}`);
    socket.currentCard = cid;
  });

  socket.on('leave-card', (cid) => {
    socket.leave(`card:${cid}`);
  });

  socket.on('disconnect', () => {
    console.log(`❌ ${socket.user.name} disconnected`);
    if (socket.currentProject) {
      onlineUsers[socket.currentProject] = (onlineUsers[socket.currentProject] || [])
        .filter(u => u.socketId !== socket.id);
      io.to(`project:${socket.currentProject}`).emit('presence-update', onlineUsers[socket.currentProject]);
    }
  });
});

// ── Seed Admin ──────────────────────────────────────────────────────────
const seedAdmin = async () => {
  if (!await User.findOne({ email: 'admin@internhub.com' })) {
    await User.create({
      name: 'Admin',
      email: 'admin@internhub.com',
      password: 'Admin@2024',
      role: 'admin',
      color: '#C8A96E',
    });
    console.log('✅ Admin seeded');
  }
};

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/intern_management')
  .then(async () => {
    console.log('✅ MongoDB connected');
    await seedAdmin();
    server.listen(process.env.PORT || 5006, () => console.log('🚀 InternHub API on :5006'));
  })
  .catch(err => console.error('❌ MongoDB error:', err));