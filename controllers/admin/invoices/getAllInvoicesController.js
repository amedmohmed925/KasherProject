const Invoice = require('../../../models/Invoice');

module.exports = async (req, res) => {
  try {
    const invoices = await Invoice.find({ adminId: req.user._id });
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

