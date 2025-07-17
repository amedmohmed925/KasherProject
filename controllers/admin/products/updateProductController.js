const Product = require('../../../models/Product');

module.exports = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, sku, originalPrice, sellingPrice, quantity, categoryId } = req.body;
    const product = await Product.findOneAndUpdate(
      { _id: id, tenantId: req.user.tenantId },
      { name, sku, originalPrice, sellingPrice, quantity, categoryId },
      { new: true }
    );
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product updated', product });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'SKU must be unique within your company' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};
