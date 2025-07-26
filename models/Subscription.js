const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  plan: { type: String, enum: ['trial', 'monthly', 'yearly', 'custom'], required: true },
  price: { 
    type: Number, 
    required: true,
    validate: {
      validator: function(value) {
        if (this.plan === 'trial') return value === 0;
        if (this.plan === 'monthly') return value === 49;
        if (this.plan === 'yearly') return value === 499;
        if (this.plan === 'custom') return value >= 0;
        return false;
      },
      message: 'Invalid price for the selected plan. Trial: 0, Monthly: 49, Yearly: 499, Custom: any value >= 0'
    }
  },
  startDate: { type: Date, required: true },
  endDate: { 
    type: Date, 
    required: true,
    validate: {
      validator: function(value) {
        if (this.plan === 'trial') {
          const trialDuration = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
          const expectedEndDate = new Date(this.startDate.getTime() + trialDuration);
          return Math.abs(value.getTime() - expectedEndDate.getTime()) < 24 * 60 * 60 * 1000; // Allow 1 day difference
        }
        return true;
      },
      message: 'Trial period must be exactly 30 days'
    }
  },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  paymentConfirmed: { type: Boolean, default: false },
  receiptImage: { type: String },
  paidAmountText: { type: String },
  duration: { 
    type: String, 
    enum: ['trial', 'month', 'year', 'custom'],
    validate: {
      validator: function(value) {
        if (this.plan === 'trial') return value === 'trial';
        if (this.plan === 'monthly') return value === 'month';
        if (this.plan === 'yearly') return value === 'year';
        if (this.plan === 'custom') return value === 'custom';
        return false;
      },
      message: 'Duration must match the selected plan'
    }
  },
  customNotes: { type: String },
  receiptFileName: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Subscription', subscriptionSchema);