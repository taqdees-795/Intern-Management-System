const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title:           { type: String, required: true },
  description:     { type: String, required: true },
  internshipType:  { type: String, required: true }, // tasks assigned by internship type
  assignedBy:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  deadline:        { type: Date, required: true },
  priority:        { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  status:          { type: String, enum: ['active', 'archived'], default: 'active' },
  category:        { type: String, default: 'General' },
  points:          { type: Number, default: 10 },
  resources:       { type: String, default: '' }, // links/notes for interns
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
