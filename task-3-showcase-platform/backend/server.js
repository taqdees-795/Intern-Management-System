const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const SECRET = process.env.JWT_SECRET || 'InternHub_SharedSecret_2024';
const User = require('./models/User');

(async () => {
  try {
    await User.collection.updateMany(
      { shareId: { $exists: false } },
      [{ $set: { shareId: { $substrCP: [ { $toString: "$_id" }, { $subtract: [ { $strLenCP: { $toString: "$_id" } }, 10 ] }, 10 ] } } }]
    );
    console.log('✅ shareId patched');
  } catch (e) { console.log('shareId patch skipped'); }
})();

let Submission;
try { Submission = require('./models/Submission'); } catch {
  const schema = new mongoose.Schema({
    intern: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
    title: String, description: String, githubLink: String, liveLink: String,
    techStack: [String], status: { type: String, default: 'submitted' }
  }, { timestamps: true });
  Submission = mongoose.model('Submission', schema);
}

const projectSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: String, description: String, longDescription: String,
  coverImage: String, liveUrl: String, githubUrl: String,
  tags: [String], category: { type: String, default: 'Web' },
  likes: { type: Number, default: 0 },
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  views: { type: Number, default: 0 },
  featured: { type: Boolean, default: false }
}, { timestamps: true });
const Project = mongoose.model('Project', projectSchema);

const auth = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try {
    req.user = await User.findById(jwt.verify(token, SECRET).id).select('-password');
    if (!req.user) return res.status(401).json({ message: 'User not found' });
    next();
  } catch { res.status(401).json({ message: 'Invalid token' }); }
};

const adminAuth = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user || user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
    req.user = user;
    next();
  } catch { res.status(401).json({ message: 'Invalid token' }); }
};

app.post('/api/auth/login', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user || !(await user.matchPassword(req.body.password)))
      return res.status(401).json({ message: 'Invalid credentials' });
    if (!user.shareId) { user.shareId = user._id.toString().slice(-10); await user.save(); }
    const token = jwt.sign({ id: user._id }, SECRET, { expiresIn: '7d' });
    res.json({ token, user: { ...user.toObject(), password: undefined } });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

app.get('/api/auth/me', auth, async (req, res) => { res.json(req.user); });

app.put('/api/profile', auth, async (req, res) => {
  const allowed = ['name', 'bio', 'skills', 'avatar', 'color', 'github', 'linkedin', 'internshipType'];
  const updates = {};
  allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
  const updated = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password');
  res.json(updated);
});

app.get('/api/submissions/mine', auth, async (req, res) => {
  const subs = await Submission.find({ intern: req.user._id }).sort({ createdAt: -1 }).lean();
  res.json(subs);
});

app.post('/api/submissions/:submissionId/showcase', auth, async (req, res) => {
  const sub = await Submission.findOne({ _id: req.params.submissionId, intern: req.user._id });
  if (!sub) return res.status(404).json({ message: 'Submission not found' });
  const payload = {
    owner: req.user._id, title: sub.title || 'Untitled',
    description: sub.description || '', liveUrl: sub.liveLink || '',
    githubUrl: sub.githubLink || '', tags: sub.techStack || [],
    category: 'Web', coverImage: ''
  };
  const project = await Project.create(payload);
  const populated = await Project.findById(project._id).populate('owner', 'name shareId internshipType avatar color');
  res.status(201).json(populated);
});

app.get('/api/projects/mine', auth, async (req, res) => {
  const projects = await Project.find({ owner: req.user._id }).sort({ createdAt: -1 });
  res.json(projects);
});

// ✅ FIX: Portfolio lookup — admins have no public portfolio
app.get('/api/portfolio/:shareId', async (req, res) => {
  try {
    const id = req.params.shareId;
    let user = await User.findOne({ shareId: id }).select('-password');
    if (!user) user = await User.findById(id).select('-password').catch(() => null);
    if (!user) return res.status(404).json({ message: 'Portfolio not found' });
    // Admins do not have public portfolios
    if (user.role === 'admin') return res.status(404).json({ message: 'Portfolio not found' });
    const projects = await Project.find({ owner: user._id }).sort({ createdAt: -1 });
    res.json({ user, projects });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ✅ FIX: Public gallery — only show projects from non-admin users
app.get('/api/projects', async (req, res) => {
  try {
    const { tag, q, category } = req.query;
    let filter = {};
    if (tag) filter.tags = tag;
    if (category) filter.category = category;
    if (q) filter.$or = [{ title: new RegExp(q, 'i') }, { tags: new RegExp(q, 'i') }, { description: new RegExp(q, 'i') }];
    let userId = null;
    try { const t = req.headers.authorization?.split(' ')[1]; if (t) userId = jwt.verify(t, SECRET).id; } catch {}

    // Exclude projects owned by admin users
    const nonAdminUsers = await User.find({ role: { $ne: 'admin' } }).select('_id');
    const nonAdminIds = nonAdminUsers.map(u => u._id);
    filter.owner = { $in: nonAdminIds };

    const projects = await Project.find(filter).populate('owner', 'name shareId internshipType avatar color').sort({ featured: -1, createdAt: -1 }).lean();
    for (const p of projects) p.likedByMe = userId ? (p.likedBy || []).some(id => id.toString() === userId.toString()) : false;
    res.json(projects);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

app.post('/api/projects', auth, async (req, res) => {
  const project = await Project.create({ ...req.body, owner: req.user._id });
  const populated = await Project.findById(project._id).populate('owner', 'name shareId internshipType avatar color');
  res.status(201).json(populated);
});

app.put('/api/projects/:id', auth, async (req, res) => {
  const project = await Project.findOneAndUpdate({ _id: req.params.id, owner: req.user._id }, req.body, { new: true });
  if (!project) return res.status(404).json({ message: 'Project not found or unauthorized' });
  res.json(project);
});

app.delete('/api/projects/:id', auth, async (req, res) => {
  if (req.user.role === 'admin') await Project.findByIdAndDelete(req.params.id);
  else {
    const result = await Project.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!result) return res.status(404).json({ message: 'Project not found or unauthorized' });
  }
  res.json({ message: 'Deleted' });
});

app.post('/api/projects/:id/like', auth, async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) return res.status(404).json({ message: 'Project not found' });
  const userId = req.user._id;
  const index = project.likedBy.indexOf(userId);
  if (index > -1) { project.likedBy.splice(index, 1); project.likes = Math.max(0, project.likes - 1); }
  else { project.likedBy.push(userId); project.likes += 1; }
  await project.save();
  res.json({ likes: project.likes, likedByMe: index === -1 });
});

app.post('/api/projects/:id/view', async (req, res) => {
  const project = await Project.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true });
  res.json({ views: project.views });
});

app.put('/api/admin/projects/:id/feature', adminAuth, async (req, res) => {
  const project = await Project.findByIdAndUpdate(req.params.id, { featured: req.body.featured }, { new: true }).populate('owner', 'name shareId');
  res.json(project);
});

app.get('/api/admin/projects', adminAuth, async (req, res) => {
  const projects = await Project.find({}).populate('owner', 'name email shareId internshipType').sort({ createdAt: -1 });
  res.json(projects);
});

app.get('/api/admin/users', adminAuth, async (req, res) => {
  const users = await User.find({ role: { $ne: 'admin' } }).select('-password').sort({ createdAt: -1 }).lean();
  for (const u of users) {
    u.projectCount = await Project.countDocuments({ owner: u._id });
    const last = await Project.findOne({ owner: u._id }).sort({ createdAt: -1 }).select('createdAt');
    u.lastActivity = last ? last.createdAt : u.createdAt;
  }
  res.json(users);
});

app.get('/api/admin/stats', adminAuth, async (req, res) => {
  const topLiked = await Project.find({}).sort({ likes: -1 }).limit(5).populate('owner', 'name').lean();
  res.json({ totalComments: 0, topLiked });
});

app.post('/api/upload', auth, async (req, res) => {
  res.json({ url: 'https://via.placeholder.com/800x400?text=Uploaded+Image' });
});

const seedAdmin = async () => {
  const exists = await User.findOne({ email: 'admin@internhub.com' });
  if (!exists) await User.create({ name: 'Admin', email: 'admin@internhub.com', password: 'Admin@2024', role: 'admin' });
};

const PORT = process.env.PORT || 5003;
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/intern_management')
  .then(async () => { await seedAdmin(); app.listen(PORT, () => console.log(`🚀 Server on ${PORT}`)); })
  .catch(e => console.error('DB failed:', e.message));