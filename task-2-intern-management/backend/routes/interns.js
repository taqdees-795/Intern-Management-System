const express = require('express');
const router = express.Router();
const User = require('../models/User');
const InternTask = require('../models/InternTask');
const { protect, adminOnly } = require('../middleware/auth');

// GET /api/interns
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const interns = await User.find({ role: 'intern' }).select('-password').sort({ createdAt: -1 });
    const data = await Promise.all(interns.map(async intern => {
      const its = await InternTask.find({ intern: intern._id });
      return {
        ...intern.toObject(),
        taskCount: its.length,
        completedCount: its.filter(t => t.status === 'approved').length,
      };
    }));
    res.json(data);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/interns/types — all distinct internship types
router.get('/types', protect, adminOnly, async (req, res) => {
  try {
    const types = await User.distinct('internshipType', { role: 'intern' });
    res.json(types);
  } catch (err) { res.json([]); }
});

// PUT /api/interns/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
    res.json(updated);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE /api/interns/:id
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    await InternTask.deleteMany({ intern: req.params.id });
    res.json({ message: 'Intern removed' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
