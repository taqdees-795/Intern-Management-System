const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  internTask: { type: mongoose.Schema.Types.ObjectId, ref: 'InternTask' },
  intern:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  admin:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message:    { type: String, required: true },
  rating:     { type: Number, min: 1, max: 5 },
  type:       { type: String, enum: ['positive', 'constructive', 'neutral'], default: 'neutral' },
}, { timestamps: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
