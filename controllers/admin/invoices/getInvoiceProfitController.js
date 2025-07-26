const Invoice = require('../../../models/Invoice');
const Product = require('../../../models/Product');

module.exports = async (req, res) => {
  
  try {
    const { id } = req.params;
    const invoice = await Invoice.findById(id);
    if (!invoice || invoice.adminId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    let totalOriginal = 0;
    let totalSelling = invoice.totalAmount;
    const purchasedProducts = [];

    for (const item of invoice.items) {
      const product = await Product.findById(item.productId);
      if (product) {
        totalOriginal += (product.originalPrice * item.quantity);
        purchasedProducts.push({
          name: product.name,
          quantity: item.quantity,
          price: item.price,
          total: item.total
        });
      }
    }

    res.json({
      invoiceId: invoice._id,
      customer: invoice.customer,
      purchasedProducts,
      totalOriginal,
      totalSelling,
      profit: totalSelling - totalOriginal
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
