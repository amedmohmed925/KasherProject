const User = require('../../models/User');
const Invoice = require('../../models/Invoice');
const Product = require('../../models/Product');

module.exports = async (req, res) => {
  try {
    if (req.user.role !== 'superAdmin') return res.status(403).json({ message: 'Forbidden' });
    const usersCount = await User.countDocuments();
    // أرباح النظام
    const profits = await Invoice.aggregate([
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    // المنتجات: السعر الأصلي وسعر البيع
    const products = await Product.find({}, 'name sku originalPrice sellingPrice');
    res.json({ usersCount, profits, products });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
