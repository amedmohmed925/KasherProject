const Product = require('../../models/Product');

module.exports = async (req, res) => {
  try {
    const { tenantId, name, sku, originalPrice, sellingPrice, quantity, category, description, image } = req.body;
    if (req.user.role !== 'admin' || req.user.tenantId.toString() !== tenantId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    const exists = await Product.findOne({ tenantId, sku });
    if (exists) return res.status(400).json({ message: 'SKU already exists' });
    const product = new Product({ tenantId, name, sku, originalPrice, sellingPrice, quantity, category, description, image });
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
