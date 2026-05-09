const mongoose = require('mongoose');

// Per-intern task progress tracking
const internTaskSchema = new mongoose.Schema({
  task:            { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
  intern:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status:          { type: String, enum: ['pending', 'in-progress', 'submitted', 'approved', 'rejected'], default: 'pending' },
  submissionLink:  { type: String, default: '' },
  submissionNote:  { type: String, default: '' },
  submittedAt:     { type: Date },
  adminNote:       { type: String, default: '' },
}, { timestamps: true });

// Unique: one record per intern per task
internTaskSchema.index({ task: 1, intern: 1 }, { unique: true });

module.exports = mongoose.model('InternTask', internTaskSchema);
