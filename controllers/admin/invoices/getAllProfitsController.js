const Invoice = require('../../../models/Invoice');
const Product = require('../../../models/Product');

module.exports = async (req, res) => {
  try {
    const invoices = await Invoice.find({ tenantId: req.user.tenantId });
    const results = [];
    let totalOriginal = 0;
    let totalSelling = 0;

    for (const invoice of invoices) {
      let invoiceOriginal = 0;
      const purchasedProducts = [];

      for (const item of invoice.items) {
        const product = await Product.findById(item.productId);
        if (product) {
          invoiceOriginal += product.originalPrice * item.quantity;
          purchasedProducts.push({
            name: product.name,
            quantity: item.quantity,
            price: item.price,
            total: item.total
          });
        }
      }

      totalOriginal += invoiceOriginal;
      totalSelling += invoice.totalAmount;

      results.push({
        invoiceId: invoice._id,
        customer: invoice.customer,
        purchasedProducts,
        totalOriginal: invoiceOriginal,
        totalSelling: invoice.totalAmount,
        profit: invoice.totalAmount - invoiceOriginal
      });
    }

    res.json({
      totalOriginal,
      totalSelling,
      profit: totalSelling - totalOriginal,
      invoices: results
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
