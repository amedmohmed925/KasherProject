const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  invoiceNumber: { type: String, required: true },
 
 
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
      total: { type: Number, required: true }
    }
  ],
  totalAmount: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

invoiceSchema.index({ adminId: 1, invoiceNumber: 1 }, { unique: true });

module.exports = mongoose.model('Invoice', invoiceSchema);
