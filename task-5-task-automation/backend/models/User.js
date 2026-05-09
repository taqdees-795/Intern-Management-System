const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Shared User model — same collection as Task 1 (intern_management DB)
// This allows same login credentials across all InternHub modules
const userSchema = new mongoose.Schema({
  name:           { type: String, required: true },
  email:          { type: String, required: true, unique: true, lowercase: true },
  password:       { type: String, required: true },
  role:           { type: String, enum: ["admin","intern"], default: "intern" },
  internshipType: { type: String, default: "Web Development" },
  shareId:        { type: String, default: () => require("crypto").randomBytes(8).toString("hex") },
  bio:            { type: String, default: "" },
  skills:         [String],
  avatar:         { type: String, default: "" },
  status:         { type: String, default: "active" },
  purchasedCourses: [{ type: mongoose.Schema.Types.ObjectId }],
  color:          { type: String, default: "#C8A96E" },
}, { timestamps: true });

userSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();
  this.password = await require("bcryptjs").hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = async function(entered) {
  return require("bcryptjs").compare(entered, this.password);
};

// Use "users" collection (same as task-1)
module.exports = mongoose.models.User || mongoose.model("User", userSchema);
