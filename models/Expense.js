const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  adminId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  title: { 
    type: String, 
    required: true,
    trim: true
  },
  amount: { 
    type: Number, 
    required: true,
    min: 0
  },
  category: { 
    type: String, 
    required: true,
    enum: ['inventory', 'utilities', 'rent', 'salaries', 'marketing', 'maintenance', 'supplies', 'other'],
    default: 'other'
  },
  description: { 
    type: String,
    trim: true
  },
  receiptUrl: { 
    type: String // For storing receipt images if needed
  },
  date: { 
    type: Date, 
    default: Date.now 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Index for efficient queries
expenseSchema.index({ adminId: 1, date: -1 });
expenseSchema.index({ adminId: 1, category: 1 });

// Update timestamp on save
expenseSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Expense', expenseSchema);
