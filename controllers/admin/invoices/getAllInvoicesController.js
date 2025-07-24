const Invoice = require('../../../models/Invoice');

module.exports = async (req, res) => {
  try {
    const { page = 1, limit = 20, startDate, endDate, customer, minTotal, maxTotal } = req.query;
    const filter = { tenantId: req.user.tenantId };
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
    if (customer) {
      filter['customer.name'] = { $regex: customer, $options: 'i' };
    }
    if (minTotal || maxTotal) {
      filter.totalAmount = {};
      if (minTotal) filter.totalAmount.$gte = Number(minTotal);
      if (maxTotal) filter.totalAmount.$lte = Number(maxTotal);
    }
    const invoices = await Invoice.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
