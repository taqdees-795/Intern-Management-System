const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Task = require('../models/Task');
const InternTask = require('../models/InternTask');

const genToken = id => jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', { expiresIn: '7d' });

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, internshipType } = req.body;
    if (await User.findOne({ email }))
      return res.status(400).json({ message: 'Email already registered' });

    const user = await User.create({ name, email, password, role: role || 'intern', internshipType });

    // When a new intern registers, auto-assign all active tasks of their internship type
    if ((role || 'intern') === 'intern') {
      const tasks = await Task.find({ internshipType, status: 'active' });
      for (const task of tasks) {
        await InternTask.create({ task: task._id, intern: user._id }).catch(() => {});
      }
    }

    res.status(201).json({
      token: genToken(user._id),
      user: { id: user._id, name: user.name, email: user.email, role: user.role, internshipType: user.internshipType }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid credentials' });
    res.json({
      token: genToken(user._id),
      user: { id: user._id, name: user.name, email: user.email, role: user.role, internshipType: user.internshipType }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/auth/me
router.get('/me', require('../middleware/auth').protect, (req, res) => res.json(req.user));

module.exports = router;
