const Tenant = require('../../models/Tenant');
const User = require('../../models/User');
const Invoice = require('../../models/Invoice');
const Product = require('../../models/Product');

module.exports = async (req, res) => {
  try {
    if (req.user.role !== 'superAdmin') return res.status(403).json({ message: 'Forbidden' });
    const tenantsCount = await Tenant.countDocuments();
    const usersCount = await User.countDocuments();
    // أرباح كل الشركات
    const profits = await Invoice.aggregate([
      { $group: { _id: '$tenantId', total: { $sum: '$totalAmount' } } }
    ]);
    // المنتجات: السعر الأصلي وسعر البيع
    const products = await Product.find({}, 'name sku originalPrice sellingPrice tenantId');
    res.json({ tenantsCount, usersCount, profits, products });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
