const Product = require('../../../models/Product');
const Invoice = require('../../../models/Invoice');

module.exports = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (req.user.role !== 'admin' || req.user.tenantId.toString() !== product.tenantId.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    // Check if product is used in invoices
    const used = await Invoice.findOne({ 'items.productId': id });
    if (used) return res.status(400).json({ message: 'Product used in invoices' });
    await product.deleteOne();
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
