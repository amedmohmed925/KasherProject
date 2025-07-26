const Invoice = require('../../models/Invoice');

module.exports = async (req, res) => {
  try {
    const { type, startDate, endDate } = req.query;
    const match = { adminId: req.user._id };
    if (startDate && endDate) {
      match.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    const groupBy = {
      daily: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
      monthly: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
      yearly: { $dateToString: { format: '%Y', date: '$createdAt' } }
    };
    const groupId = groupBy[type] || groupBy['daily'];
    const report = await Invoice.aggregate([
      { $match: match },
      { $unwind: '$items' },
      { $group: {
        _id: groupId,
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
