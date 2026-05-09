const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const User = require('../models/User');
const InternTask = require('../models/InternTask');
const { protect, adminOnly } = require('../middleware/auth');

// GET /api/tasks — admin sees all, intern sees tasks of their type
router.get('/', protect, async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      const tasks = await Task.find().populate('assignedBy', 'name').sort({ createdAt: -1 });
      return res.json(tasks);
    }
    // For intern: get tasks of their internship type
    const tasks = await Task.find({ internshipType: req.user.internshipType, status: 'active' })
      .populate('assignedBy', 'name').sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/tasks/types — get all internship types that have tasks
router.get('/types', protect, adminOnly, async (req, res) => {
  try {
    const types = await Task.distinct('internshipType');
    res.json(types);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/tasks — admin creates task for an internship type
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const task = await Task.create({ ...req.body, assignedBy: req.user._id });

    // Auto-assign to ALL active interns of this internship type
    const interns = await User.find({ role: 'intern', internshipType: task.internshipType, status: 'active' });
    let assigned = 0;
    for (const intern of interns) {
      try {
        await InternTask.create({ task: task._id, intern: intern._id });
        assigned++;
      } catch (e) {} // skip duplicates
    }
    console.log(`Task "${task.title}" assigned to ${assigned} interns (${task.internshipType})`);
    res.status(201).json({ ...task.toObject(), assignedCount: assigned });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/tasks/:id
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(task);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE /api/tasks/:id
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    await InternTask.deleteMany({ task: req.params.id });
    res.json({ message: 'Task deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
