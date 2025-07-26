const Product = require('../../../models/Product');
const Category = require('../../../models/Category');

const searchProductsController = async (req, res) => {
  try {
    const { name, category, profit, quantity, price } = req.query;

    // بناء شروط البحث
    const query = { adminId: req.user._id };
    if (name) query.name = { $regex: name, $options: 'i' };
    if (profit) query.profit = { $gte: profit };
    if (quantity) query.quantity = { $gte: quantity };
    if (price) query.price = { $gte: price };

    // إذا كان البحث بالفئة، ابحث عن categoryId
    if (category) {
      const categoryDoc = await Category.findOne({ 
        name: { $regex: category, $options: 'i' }, 
        adminId: req.user._id 
      });
      if (categoryDoc) {
        query.categoryId = categoryDoc._id;
      } else {
        // إذا لم توجد الفئة، أرجع نتيجة فارغة
        return res.status(200).json({ products: [] });
      }
    }

    // البحث في قاعدة البيانات
    const products = await Product.find(query).populate('categoryId', 'name');

    res.status(200).json({ products });
  } catch (error) {
    console.error('Error in searchProductsController:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = searchProductsController;
