const Product = require('../../../models/Product');

module.exports = async (req, res) => {
  try {
    const { name, sku, originalPrice, sellingPrice, quantity, categoryId } = req.body;
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    if (!name || !sku || !originalPrice || !sellingPrice || !quantity || !categoryId) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const exists = await Product.findOne({ tenantId: req.user.tenantId, sku });
    if (exists) return res.status(400).json({ message: 'SKU already exists' });
    const product = new Product({
      tenantId: req.user.tenantId,
      name,
      sku,
      originalPrice,
      sellingPrice,
      quantity,
      categoryId
    });
    await product.save();
    res.status(201).json({ message: 'Product created', product });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'SKU must be unique within your company' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};
