const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  adminId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true },
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  phone: { 
    type: String,
    trim: true,
    sparse: true
  },
  email: { 
    type: String,
    trim: true,
    lowercase: true,
    sparse: true
  },
  address: { 
    type: String,
    trim: true
  },
  notes: { 
    type: String 
  },
  totalOrders: { 
    type: Number, 
    default: 0 
  },
  totalSpent: { 
    type: Number, 
    default: 0 
  },
  lastOrderDate: { 
    type: Date 
  },
  status: { 
    type: String, 
    enum: ['active', 'inactive'], 
    default: 'active' 
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

// Compound index to ensure unique customer per admin (by name and phone)
customerSchema.index({ adminId: 1, name: 1, phone: 1 }, { unique: true });

// Index for search functionality
customerSchema.index({ adminId: 1, name: 'text', phone: 'text', email: 'text' });

// Update timestamp on save
customerSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Customer', customerSchema);
