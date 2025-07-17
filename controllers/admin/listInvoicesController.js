const Invoice = require('../../models/Invoice');

module.exports = async (req, res) => {
  try {
    const { page = 1, limit = 10, date } = req.query;
    const filter = { tenantId: req.user.tenantId };
    if (date) {
      const d = new Date(date);
      filter.createdAt = { $gte: d, $lt: new Date(d.getTime() + 24 * 60 * 60 * 1000) };
    }
    const invoices = await Invoice.find(filter)
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
