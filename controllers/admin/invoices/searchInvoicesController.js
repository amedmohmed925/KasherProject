const Invoice = require('../../../models/Invoice');

const searchInvoicesController = async (req, res) => {
  try {
    const { customerName, price, date } = req.query;

    // بناء شروط البحث
    const query = {};
    if (customerName) query.customerName = { $regex: customerName, $options: 'i' };
    if (price) query.totalPrice = { $gte: price };
    if (date) query.date = { $gte: new Date(date) };

    // البحث في قاعدة البيانات
    const invoices = await Invoice.find(query);

    res.status(200).json({ invoices });
  } catch (error) {
    console.error('Error in searchInvoicesController:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = searchInvoicesController;
