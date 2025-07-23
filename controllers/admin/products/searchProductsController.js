const Product = require('../../../models/Product');

const searchProductsController = async (req, res) => {
  try {
    const { name, category, profit, quantity, price } = req.query;

    // بناء شروط البحث
    const query = {};
    if (name) query.name = { $regex: name, $options: 'i' };
    if (category) query.category = category;
    if (profit) query.profit = { $gte: profit };
    if (quantity) query.quantity = { $gte: quantity };
    if (price) query.price = { $gte: price };

    // البحث في قاعدة البيانات
    const products = await Product.find(query);

    res.status(200).json({ products });
  } catch (error) {
    console.error('Error in searchProductsController:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = searchProductsController;
