const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  type: { type: String, enum: ['daily', 'monthly', 'yearly'], required: true },
  period: { type: String, required: true },
  totalSales: { type: Number, required: true },
  totalInvoices: { type: Number, required: true },
  topProducts: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      name: { type: String, required: true },
      quantitySold: { type: Number, required: true }
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Report', reportSchema);
