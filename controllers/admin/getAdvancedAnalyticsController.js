const Invoice = require('../../models/Invoice');
const Product = require('../../models/Product');
const Category = require('../../models/Category');

module.exports = async (req, res) => {
  try {
    const adminId = req.user._id;
    const { startDate, endDate, period = 'month' } = req.query;

    // تحديد نطاق التاريخ حسب المدة
    let dateFilter = { adminId };
    
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else {
      // النطاق الافتراضي حسب المدة
      const now = new Date();
      let fromDate;
      
      switch (period) {
        case 'week':
          fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'year':
          fromDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
      }
      
      dateFilter.createdAt = { $gte: fromDate, $lte: now };
    }

    // إحصائيات الفواتير
    const invoiceStats = await Invoice.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          totalInvoices: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          averageInvoiceValue: { $avg: '$totalAmount' }
        }
      }
    ]);

    // المنتجات الأكثر مبيعاً
    const topProducts = await Invoice.aggregate([
      { $match: dateFilter },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          productName: { $first: '$items.name' },
          totalSold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.total' }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 }
    ]);

    // إحصائيات المخزون
    const inventoryStats = await Product.aggregate([
      { $match: { adminId } },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' },
          totalValue: { $sum: { $multiply: ['$quantity', '$sellingPrice'] } },
          lowStockProducts: {
            $sum: { $cond: [{ $lte: ['$quantity', 10] }, 1, 0] }
          },
          outOfStockProducts: {
            $sum: { $cond: [{ $eq: ['$quantity', 0] }, 1, 0] }
          }
        }
      }
    ]);

    // إحصائيات الفئات
    const categoryStats = await Category.aggregate([
      { $match: { adminId } },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: 'categoryId',
          as: 'products'
        }
      },
      {
        $project: {
          name: 1,
          productCount: { $size: '$products' },
          totalValue: {
            $sum: {
              $map: {
                input: '$products',
                as: 'product',
                in: { $multiply: ['$$product.quantity', '$$product.sellingPrice'] }
              }
            }
          }
        }
      },
      { $sort: { productCount: -1 } }
    ]);

    // مبيعات يومية للرسم البياني
    const dailySales = await Invoice.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          totalSales: { $sum: '$totalAmount' },
          invoiceCount: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
      { $limit: 30 }
    ]);

    res.json({
      success: true,
      period,
      dateRange: dateFilter.createdAt,
      invoiceStats: invoiceStats[0] || {
        totalInvoices: 0,
        totalRevenue: 0,
        averageInvoiceValue: 0
      },
      inventoryStats: inventoryStats[0] || {
        totalProducts: 0,
        totalQuantity: 0,
        totalValue: 0,
        lowStockProducts: 0,
        outOfStockProducts: 0
      },
      topProducts,
      categoryStats,
      dailySales
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
