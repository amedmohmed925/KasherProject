const Invoice = require('../../../models/Invoice');

/**
 * Compare analytics between different periods
 * @route GET /api/admin/analytics/compare
 * @access Private (Admin)
 */
const compareAnalytics = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { 
      currentPeriod = 'month',
      comparePeriod = 'month' 
    } = req.query;

    // حساب الفترات
    const periods = calculateComparePeriods(currentPeriod, comparePeriod);

    // جلب بيانات الفترة الحالية
    const currentStats = await getStatsForPeriod(adminId, periods.current);
    
    // جلب بيانات فترة المقارنة
    const compareStats = await getStatsForPeriod(adminId, periods.compare);

    // حساب النسب والتغييرات
    const comparison = {
      revenue: calculateChange(currentStats.totalRevenue, compareStats.totalRevenue),
      orders: calculateChange(currentStats.totalOrders, compareStats.totalOrders),
      profit: calculateChange(currentStats.totalProfit, compareStats.totalProfit),
      averageOrder: calculateChange(currentStats.averageOrderValue, compareStats.averageOrderValue),
      customers: calculateChange(currentStats.uniqueCustomers, compareStats.uniqueCustomers)
    };

    res.json({
      success: true,
      data: {
        current: {
          period: periods.current.description,
          stats: currentStats
        },
        previous: {
          period: periods.compare.description,
          stats: compareStats
        },
        comparison
      }
    });

  } catch (error) {
    console.error('Error comparing analytics:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
};

// دالة لحساب الفترات للمقارنة
function calculateComparePeriods(currentPeriod, comparePeriod) {
  const now = new Date();
  let current = {}, compare = {};

  switch (currentPeriod) {
    case 'today':
      current.start = new Date(now);
      current.start.setHours(0, 0, 0, 0);
      current.end = new Date(now);
      current.end.setHours(23, 59, 59, 999);
      current.description = 'اليوم';

      if (comparePeriod === 'today') {
        compare.start = new Date(current.start);
        compare.start.setDate(compare.start.getDate() - 1);
        compare.end = new Date(current.end);
        compare.end.setDate(compare.end.getDate() - 1);
        compare.description = 'أمس';
      }
      break;

    case 'week':
      current.start = new Date(now);
      current.start.setDate(current.start.getDate() - current.start.getDay());
      current.start.setHours(0, 0, 0, 0);
      current.end = new Date(current.start);
      current.end.setDate(current.end.getDate() + 6);
      current.end.setHours(23, 59, 59, 999);
      current.description = 'هذا الأسبوع';

      if (comparePeriod === 'week') {
        compare.start = new Date(current.start);
        compare.start.setDate(compare.start.getDate() - 7);
        compare.end = new Date(current.end);
        compare.end.setDate(compare.end.getDate() - 7);
        compare.description = 'الأسبوع الماضي';
      }
      break;

    case 'month':
      current.start = new Date(now.getFullYear(), now.getMonth(), 1);
      current.end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      current.description = 'هذا الشهر';

      if (comparePeriod === 'month') {
        compare.start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        compare.end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        compare.description = 'الشهر الماضي';
      }
      break;

    case 'year':
      current.start = new Date(now.getFullYear(), 0, 1);
      current.end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
      current.description = 'هذا العام';

      if (comparePeriod === 'year') {
        compare.start = new Date(now.getFullYear() - 1, 0, 1);
        compare.end = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
        compare.description = 'العام الماضي';
      }
      break;
  }

  return { current, compare };
}

// دالة لجلب الإحصائيات لفترة معينة
async function getStatsForPeriod(adminId, period) {
  const dateRange = { $gte: period.start, $lte: period.end };

  // الإحصائيات الأساسية
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
        totalDiscount: { $sum: '$discount.amount' }
      }
    }
  ]);

  // المصروفات
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
        }
      }
    }
  ]);

  // عدد العملاء الفريدين
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
        _id: '$customerId'
      }
    },
    {
      $count: 'uniqueCustomers'
    }
  ]);

  const stats = basicStats[0] || {
    totalRevenue: 0,
    totalOrders: 0,
    totalProfit: 0,
    averageOrderValue: 0,
    totalDiscount: 0
  };

  const expenses = expensesData[0] || { totalExpenses: 0 };
  const customers = customerStats[0] || { uniqueCustomers: 0 };

  return {
    ...stats,
    totalExpenses: expenses.totalExpenses,
    uniqueCustomers: customers.uniqueCustomers,
    netProfit: stats.totalProfit
  };
}

// دالة لحساب نسبة التغيير
function calculateChange(current, previous) {
  if (previous === 0) {
    return {
      value: current,
      percentage: current > 0 ? 100 : 0,
      trend: current > 0 ? 'up' : 'neutral'
    };
  }

  const change = current - previous;
  const percentage = (change / previous) * 100;
  
  return {
    value: change,
    percentage: Number(percentage.toFixed(2)),
    trend: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral'
  };
}

module.exports = compareAnalytics;
