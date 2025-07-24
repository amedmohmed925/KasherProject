const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  plan: { type: String, enum: ['trial', 'monthly', 'yearly', 'custom'], required: true },
  price: { type: Number, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  paymentConfirmed: { type: Boolean, default: false },
  receiptImage: { type: String },
  paidAmountText: { type: String },
  duration: { type: String, enum: ['month', 'year', 'custom'] },
  customNotes: { type: String },
  receiptFileName: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Subscription', subscriptionSchema);