const Product = require('../../../models/Product');

module.exports = async (req, res) => {
  try {
    const adminId = req.user._id;
    const { startDate, endDate, category } = req.query;

    // بناء شروط التصفية
    const matchConditions = { adminId };
    
    if (category) {
      matchConditions.category = category;
    }

    if (startDate || endDate) {
      matchConditions.createdAt = {};
      if (startDate) matchConditions.createdAt.$gte = new Date(startDate);
      if (endDate) matchConditions.createdAt.$lte = new Date(endDate);
    }

    // تقرير المخزون الحالي
    const inventoryReport = await Product.aggregate([
      { $match: matchConditions },
      {
        $project: {
          name: 1,
          sku: 1,
          category: 1,
          quantity: 1,
          originalPrice: 1,
          sellingPrice: 1,
          totalOriginalValue: { $multiply: ['$quantity', '$originalPrice'] },
          totalSellingValue: { $multiply: ['$quantity', '$sellingPrice'] },
          profit: { $subtract: ['$sellingPrice', '$originalPrice'] },
          totalProfit: { 
            $multiply: [
              '$quantity', 
              { $subtract: ['$sellingPrice', '$originalPrice'] }
            ] 
          },
          stockStatus: {
            $switch: {
              branches: [
                { case: { $eq: ['$quantity', 0] }, then: 'نافد' },
                { case: { $lt: ['$quantity', 10] }, then: 'منخفض' },
                { case: { $lt: ['$quantity', 50] }, then: 'متوسط' }
              ],
              default: 'جيد'
            }
          },
          createdAt: 1,
          updatedAt: 1
        }
      },
      { $sort: { quantity: 1, name: 1 } } // ترتيب حسب الكمية ثم الاسم
    ]);

    // ملخص التقرير
    const summary = await Product.aggregate([
      { $match: matchConditions },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' },
          totalOriginalValue: { $sum: { $multiply: ['$quantity', '$originalPrice'] } },
          totalSellingValue: { $sum: { $multiply: ['$quantity', '$sellingPrice'] } },
          totalProfit: { 
            $sum: { 
              $multiply: [
                '$quantity', 
                { $subtract: ['$sellingPrice', '$originalPrice'] }
              ] 
            } 
          },
          avgQuantity: { $avg: '$quantity' },
          minQuantity: { $min: '$quantity' },
          maxQuantity: { $max: '$quantity' }
        }
      }
    ]);

    // إحصائيات حالة المخزون
    const stockStatusStats = await Product.aggregate([
      { $match: matchConditions },
      {
        $project: {
          stockStatus: {
            $switch: {
              branches: [
                { case: { $eq: ['$quantity', 0] }, then: 'نافد' },
                { case: { $lt: ['$quantity', 10] }, then: 'منخفض' },
                { case: { $lt: ['$quantity', 50] }, then: 'متوسط' }
              ],
              default: 'جيد'
            }
          }
        }
      },
      {
        $group: {
          _id: '$stockStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      filters: {
        startDate: startDate || null,
        endDate: endDate || null,
        category: category || null
      },
      summary: summary[0] || {},
      stockStatusBreakdown: stockStatusStats,
      products: inventoryReport,
      generatedAt: new Date().toISOString()
    });
  } catch (err) {
    console.error('Error in inventoryReportController:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
