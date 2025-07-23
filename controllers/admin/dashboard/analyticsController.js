const Product = require('../../../models/Product');
const Invoice = require('../../../models/Invoice');

const analyticsController = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // بناء شروط التصفية حسب التاريخ
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    // جلب حالة المخزون
    const inventoryStatus = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalQuantity: { $sum: '$quantity' },
          totalValue: { $sum: { $multiply: ['$quantity', '$sellingPrice'] } }
        }
      }
    ]);

    // جلب ملخصات الفواتير
    const invoiceSummaries = await Invoice.aggregate([
      { $match: { createdAt: dateFilter } },
      {
        $group: {
          _id: null,
          totalInvoices: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' }
        }
      }
    ]);

    res.status(200).json({
      inventoryStatus: inventoryStatus[0] || {},
      invoiceSummaries: invoiceSummaries[0] || {}
    });
  } catch (error) {
    console.error('Error in analyticsController:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = analyticsController;
