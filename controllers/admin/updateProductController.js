const Product = require('../../models/Product');

module.exports = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (req.user.role !== 'admin' || req.user.tenantId.toString() !== product.tenantId.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    Object.assign(product, req.body, { updatedAt: new Date() });
    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
