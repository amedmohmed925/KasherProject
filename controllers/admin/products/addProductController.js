const Product = require('../../../models/Product');

module.exports = async (req, res) => {
  try {
    const { name, sku, originalPrice, sellingPrice, quantity, category, description, image } = req.body;
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    if (!name || !sku || !originalPrice || !sellingPrice || !quantity) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    const product = new Product({
      adminId: req.user._id,
      name,
      sku,
      originalPrice,
      sellingPrice,
      quantity,
      category,
      description,
      image
    });

    await product.save();
    res.status(201).json({ message: 'Product created', product });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
