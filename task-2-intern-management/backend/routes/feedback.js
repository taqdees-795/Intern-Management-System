const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const mongoose = require('mongoose');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const fb = await Feedback.create({ ...req.body, admin: req.user._id });
    res.status(201).json(fb);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/intern/:internId', protect, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.internId)) return res.json([]);
    const fbs = await Feedback.find({ intern: req.params.internId })
      .populate('admin', 'name').sort({ createdAt: -1 });
    res.json(fbs);
  } catch (err) { res.json([]); }
});

module.exports = router;
