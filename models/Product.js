const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  sku: { type: String, required: true },
  originalPrice: { type: Number, required: true },
  sellingPrice: { type: Number, required: true },
  quantity: { type: Number, required: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  description: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

productSchema.index({ adminId: 1, sku: 1 }, { unique: true });

module.exports = mongoose.model('Product', productSchema);
