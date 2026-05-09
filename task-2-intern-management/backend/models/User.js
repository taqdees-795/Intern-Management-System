const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:             { type: String, required: true, trim: true },
  email:            { type: String, required: true, unique: true, lowercase: true },
  password:         { type: String, required: true },
  role:             { type: String, enum: ['admin', 'intern'], default: 'intern' },
  internshipType:   { type: String, default: 'Web Development' },
  avatar:           { type: String, default: '' },
  joinDate:         { type: Date, default: Date.now },
  status:           { type: String, enum: ['active', 'inactive', 'completed'], default: 'active' },
  bio:              { type: String, default: '' },
  skills:           [String],
  phone:            { type: String, default: '' },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model('User', userSchema);
