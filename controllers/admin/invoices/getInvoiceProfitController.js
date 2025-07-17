const Invoice = require('../../../models/Invoice');
const Product = require('../../../models/Product');

module.exports = async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await Invoice.findById(id);
    if (!invoice || invoice.tenantId.toString() !== req.user.tenantId.toString()) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    let totalOriginal = 0;
    let totalSelling = invoice.totalAmount;
    for (const item of invoice.items) {
      const product = await Product.findById(item.productId);
      if (product) {
        totalOriginal += (product.originalPrice * item.quantity);
      }
    }
    res.json({
      invoiceId: invoice._id,
      totalOriginal,
      totalSelling,
      profit: totalSelling - totalOriginal
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
