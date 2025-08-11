const Invoice = require('../../../models/Invoice');
const Customer = require('../../../models/Customer');
const Product = require('../../../models/Product');

/**
 * Get analytics with custom time periods
 * Supports: today, week, month, year, custom range
 * @route GET /api/admin/analytics/periods
 * @access Private (Admin)
 */
const getAnalyticsByPeriod = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { 
      period = 'today', // today, week, month, year, custom
      startDate, 
      endDate 
    } = req.query;

    let dateRange = {};

    // تحديد الفترة الزمنية
    switch (period) {
      case 'today':
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const endOfToday = new Date(today);
        endOfToday.setHours(23, 59, 59, 999);
        dateRange = { $gte: today, $lte: endOfToday };
        break;

      case 'week':
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // بداية الأسبوع (الأحد)
        weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);
        dateRange = { $gte: weekStart, $lte: weekEnd };
        break;

      case 'month':
        const monthStart = new Date();
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);
        const monthEnd = new Date(monthStart);
        monthEnd.setMonth(monthEnd.getMonth() + 1);
        monthEnd.setDate(0);
        monthEnd.setHours(23, 59, 59, 999);
        dateRange = { $gte: monthStart, $lte: monthEnd };
        break;

      case 'year':
        const yearStart = new Date();
        yearStart.setMonth(0, 1);
        yearStart.setHours(0, 0, 0, 0);
        const yearEnd = new Date(yearStart);
        yearEnd.setFullYear(yearEnd.getFullYear() + 1);
        yearEnd.setDate(0);
        yearEnd.setHours(23, 59, 59, 999);
        dateRange = { $gte: yearStart, $lte: yearEnd };
        break;

      case 'custom':
        if (!startDate || !endDate) {
          return res.status(400).json({
            success: false,
            message: 'تاريخ البداية والنهاية مطلوبان للفترة المخصصة'
          });
        }
        const customStart = new Date(startDate);
        customStart.setHours(0, 0, 0, 0);
        const customEnd = new Date(endDate);
        customEnd.setHours(23, 59, 59, 999);
        dateRange = { $gte: customStart, $lte: customEnd };
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'فترة زمنية غير صالحة'
        });
    }

    // الحصول على البيانات الأساسية
    const basicStats = await Invoice.aggregate([
      {
        $match: {
          adminId: adminId,
          createdAt: dateRange
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          totalOrders: { $sum: 1 },
          totalProfit: { $sum: '$profit' },
          averageOrderValue: { $avg: '$totalAmount' },
          totalDiscount: { $sum: '$discount.amount' },
          totalSubtotal: { $sum: '$subtotal' }
        }
      }
    ]);

    // حساب إجمالي المصروفات من أسعار الشراء
    const expensesData = await Invoice.aggregate([
      {
        $match: {
          adminId: adminId,
          createdAt: dateRange
        }
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: null,
          totalExpenses: {
            $sum: {
              $multiply: ['$items.quantity', '$items.originalPrice']
            }
          },
          totalItemsSold: { $sum: '$items.quantity' }
        }
      }
    ]);

    // أفضل المنتجات مبيعاً
    const topProducts = await Invoice.aggregate([
      {
        $match: {
          adminId: adminId,
          createdAt: dateRange
        }
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          productName: { $first: '$items.name' },
          sku: { $first: '$items.sku' },
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.total' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 }
    ]);

    // إحصائيات العملاء
    const customerStats = await Invoice.aggregate([
      {
        $match: {
          adminId: adminId,
          createdAt: dateRange,
          customerId: { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: '$customerId',
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$totalAmount' }
        }
      },
      {
        $group: {
          _id: null,
          uniqueCustomers: { $sum: 1 },
          averageCustomerValue: { $avg: '$totalSpent' },
          totalCustomerRevenue: { $sum: '$totalSpent' }
        }
      }
    ]);

    // توزيع طرق الدفع
    const paymentMethods = await Invoice.aggregate([
      {
        $match: {
          adminId: adminId,
          createdAt: dateRange
        }
      },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          amount: { $sum: '$totalAmount' }
        }
      }
    ]);

    // الاتجاه الزمني (يومي، أسبوعي، شهري حسب الفترة)
    let timeFormat;
    if (period === 'today') {
      timeFormat = '%H:00'; // ساعات اليوم
    } else if (period === 'week') {
      timeFormat = '%Y-%m-%d'; // أيام الأسبوع
    } else if (period === 'month') {
      timeFormat = '%Y-%m-%d'; // أيام الشهر
    } else if (period === 'year') {
      timeFormat = '%Y-%m'; // شهور السنة
    } else {
      // للفترة المخصصة، نحدد التنسيق حسب طول الفترة
      const start = new Date(startDate);
      const end = new Date(endDate);
      const daysDiff = (end - start) / (1000 * 60 * 60 * 24);
      
      if (daysDiff <= 1) {
        timeFormat = '%H:00';
      } else if (daysDiff <= 31) {
        timeFormat = '%Y-%m-%d';
      } else {
        timeFormat = '%Y-%m';
      }
    }

    const timeTrend = await Invoice.aggregate([
      {
        $match: {
          adminId: adminId,
          createdAt: dateRange
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: timeFormat, date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 },
          profit: { $sum: '$profit' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // حساب المصروفات لكل فترة زمنية
    const expensesTrend = await Invoice.aggregate([
      {
        $match: {
          adminId: adminId,
          createdAt: dateRange
        }
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: { $dateToString: { format: timeFormat, date: '$createdAt' } },
          expenses: {
            $sum: {
              $multiply: ['$items.quantity', '$items.originalPrice']
            }
          }
        }
      }
    ]);

    // دمج المصروفات مع الاتجاه الزمني
    const expenseMap = new Map(expensesTrend.map(e => [e._id, e.expenses]));
    timeTrend.forEach(period => {
      period.expenses = expenseMap.get(period._id) || 0;
      period.netProfit = period.profit;
    });

    // تجهيز البيانات للاستجابة
    const stats = basicStats[0] || {
      totalRevenue: 0,
      totalOrders: 0,
      totalProfit: 0,
      averageOrderValue: 0,
      totalDiscount: 0,
      totalSubtotal: 0
    };

    const expenses = expensesData[0] || {
      totalExpenses: 0,
      totalItemsSold: 0
    };

    const customers = customerStats[0] || {
      uniqueCustomers: 0,
      averageCustomerValue: 0,
      totalCustomerRevenue: 0
    };

    // حساب معدلات إضافية
    const profitMargin = stats.totalRevenue > 0 ? (stats.totalProfit / stats.totalRevenue) * 100 : 0;
    const discountRate = stats.totalSubtotal > 0 ? (stats.totalDiscount / stats.totalSubtotal) * 100 : 0;

    res.json({
      success: true,
      data: {
        period: {
          type: period,
          startDate: period === 'custom' ? startDate : null,
          endDate: period === 'custom' ? endDate : null,
          description: getPeriodDescription(period, startDate, endDate)
        },
        overview: {
          totalRevenue: stats.totalRevenue,
          totalOrders: stats.totalOrders,
          totalProfit: stats.totalProfit,
          totalExpenses: expenses.totalExpenses,
          netProfit: stats.totalProfit,
          averageOrderValue: stats.averageOrderValue,
          totalDiscount: stats.totalDiscount,
          totalItemsSold: expenses.totalItemsSold,
          profitMargin: Number(profitMargin.toFixed(2)),
          discountRate: Number(discountRate.toFixed(2))
        },
        customers: {
          uniqueCustomers: customers.uniqueCustomers,
          averageCustomerValue: customers.averageCustomerValue,
          totalCustomerRevenue: customers.totalCustomerRevenue
        },
        topProducts,
        paymentMethods,
        timeTrend
      }
    });

  } catch (error) {
    console.error('Error getting analytics by period:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
};

// دالة مساعدة لوصف الفترة
function getPeriodDescription(period, startDate, endDate) {
  const today = new Date();
  
  switch (period) {
    case 'today':
      return `اليوم - ${today.toLocaleDateString('ar-EG')}`;
    case 'week':
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      return `هذا الأسبوع - ${weekStart.toLocaleDateString('ar-EG')} إلى ${weekEnd.toLocaleDateString('ar-EG')}`;
    case 'month':
      return `هذا الشهر - ${today.toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' })}`;
    case 'year':
      return `هذا العام - ${today.getFullYear()}`;
    case 'custom':
      return `فترة مخصصة - ${new Date(startDate).toLocaleDateString('ar-EG')} إلى ${new Date(endDate).toLocaleDateString('ar-EG')}`;
    default:
      return period;
  }
}

module.exports = getAnalyticsByPeriod;
