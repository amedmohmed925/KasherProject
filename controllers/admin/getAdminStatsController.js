const User = require('../../models/User');
const Invoice = require('../../models/Invoice');

module.exports = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    // عدد الفواتير
    const invoicesCount = await Invoice.countDocuments({ tenantId });
    // أرباح اليوم
    const startOfDay = new Date();
    startOfDay.setHours(0,0,0,0);
    const endOfDay = new Date();
    endOfDay.setHours(23,59,59,999);
    const todayProfit = await Invoice.aggregate([
      { $match: { tenantId, createdAt: { $gte: startOfDay, $lte: endOfDay } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    // أرباح الشهر
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    const monthProfit = await Invoice.aggregate([
      { $match: { tenantId, createdAt: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    // أرباح السنة
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
    const yearProfit = await Invoice.aggregate([
      { $match: { tenantId, createdAt: { $gte: startOfYear, $lte: endOfYear } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    
    
    res.json({
      invoicesCount,
      todayProfit: todayProfit[0]?.total || 0,
      monthProfit: monthProfit[0]?.total || 0,
      yearProfit: yearProfit[0]?.total || 0
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
