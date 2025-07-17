const Product = require('../../models/Product');

module.exports = async (req, res) => {
  try {
    const { sku } = req.params;
    const product = await Product.findOne({ sku, tenantId: req.user.tenantId });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ name: product.name, sellingPrice: product.sellingPrice, quantity: product.quantity });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
