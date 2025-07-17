const Invoice = require('../../models/Invoice');

module.exports = async (req, res) => {
  try {
    if (req.user.role !== 'superAdmin') return res.status(403).json({ message: 'Forbidden' });
    // Aggregate data from all tenants
    const report = await Invoice.aggregate([
      { $unwind: '$items' },
      { $group: {
        _id: null,
        totalSales: { $sum: '$totalAmount' },
        totalInvoices: { $sum: 1 },
        topProducts: {
          $push: {
            productId: '$items.productId',
            name: '$items.name',
            quantitySold: '$items.quantity'
          }
        }
      }}
    ]);
    res.json(report);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
