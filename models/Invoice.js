const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  invoiceNumber: { type: String, required: true },
  customerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Customer',
    required: false // Optional for quick sales without customer registration
  },
  customer: {
    name: { type: String, required: true },
    phone: { type: String }
  },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      sku: { type: String, required: true },
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
      originalPrice: { type: Number, required: true }, // سعر الشراء
      total: { type: Number, required: true }
    }
  ],
  subtotal: { type: Number, required: true }, // Total before discount
  discount: {
    type: { type: String, enum: ['percentage', 'fixed'], default: 'fixed' },
    value: { type: Number, default: 0 },
    amount: { type: Number, default: 0 } // Actual discount amount
  },
  totalAmount: { type: Number, required: true }, // Final amount after discount
  profit: { type: Number, required: true }, // Total profit from this invoice
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'cancelled'], 
    default: 'completed' 
  },
  paymentMethod: { 
    type: String, 
    enum: ['cash', 'card', 'bank_transfer', 'other'], 
    default: 'cash' 
  },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

invoiceSchema.index({ adminId: 1, invoiceNumber: 1 }, { unique: true });

module.exports = mongoose.model('Invoice', invoiceSchema);
