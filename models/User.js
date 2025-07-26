const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  companyName: { type: String },
  companyAddress: { type: String },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: [ 'admin', 'superAdmin'], required: true },
  isVerified: { type: Boolean, default: false },
  otp: { type: String },
  phone: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
