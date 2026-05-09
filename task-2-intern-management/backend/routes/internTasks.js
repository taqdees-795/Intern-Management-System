const express = require('express');
const router = express.Router();
const InternTask = require('../models/InternTask');
const { protect, adminOnly } = require('../middleware/auth');

// GET /api/interntasks — intern gets their own task progress
router.get('/', protect, async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { intern: req.user._id };
    const items = await InternTask.find(filter)
      .populate('task')
      .populate('intern', 'name email internshipType')
      .sort({ createdAt: -1 });
    res.json(items);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/interntasks/by-intern/:internId — admin views specific intern
router.get('/by-intern/:internId', protect, adminOnly, async (req, res) => {
  try {
    const items = await InternTask.find({ intern: req.params.internId })
      .populate('task').sort({ createdAt: -1 });
    res.json(items);
  } catch (err) { res.json([]); }
});

// PUT /api/interntasks/:id/submit
router.put('/:id/submit', protect, async (req, res) => {
  try {
    const it = await InternTask.findByIdAndUpdate(
      req.params.id,
      { submissionLink: req.body.submissionLink, submissionNote: req.body.submissionNote,
        status: 'submitted', submittedAt: new Date() },
      { new: true }
    ).populate('task');
    res.json(it);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/interntasks/:id/status — admin approve/reject
router.put('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const it = await InternTask.findByIdAndUpdate(
      req.params.id, { status: req.body.status, adminNote: req.body.adminNote || '' }, { new: true }
    ).populate('intern', 'name').populate('task', 'title');
    res.json(it);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/interntasks/:id/start
router.put('/:id/start', protect, async (req, res) => {
  try {
    const it = await InternTask.findByIdAndUpdate(
      req.params.id, { status: 'in-progress' }, { new: true }
    ).populate('task');
    res.json(it);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
