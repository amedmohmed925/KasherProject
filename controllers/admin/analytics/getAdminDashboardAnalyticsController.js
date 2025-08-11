const Invoice = require('../../../models/Invoice');
const Product = require('../../../models/Product');

/**
 * Get comprehensive admin dashboard analytics
 * @route GET /api/admin/analytics/dashboard
 * @access Private (Admin)
 */
const getAdminDashboardAnalytics = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { 
      period = 'all', // all, today, week, month, year, custom
      startDate, 
      endDate 
    } = req.query;

    let dateRange = {};

    // تحديد الفترة الزمنية
    if (period !== 'all') {
      switch (period) {
        case 'today':
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const endOfToday = new Date(today);
          endOfToday.setHours(23, 59, 59, 999);
          dateRange = { createdAt: { $gte: today, $lte: endOfToday } };
          break;

        case 'week':
          const weekStart = new Date();
          weekStart.setDate(weekStart.getDate() - weekStart.getDay());
          weekStart.setHours(0, 0, 0, 0);
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekEnd.getDate() + 6);
          weekEnd.setHours(23, 59, 59, 999);
          dateRange = { createdAt: { $gte: weekStart, $lte: weekEnd } };
          break;

        case 'month':
          const monthStart = new Date();
          monthStart.setDate(1);
          monthStart.setHours(0, 0, 0, 0);
          const monthEnd = new Date(monthStart);
          monthEnd.setMonth(monthEnd.getMonth() + 1);
          monthEnd.setDate(0);
          monthEnd.setHours(23, 59, 59, 999);
          dateRange = { createdAt: { $gte: monthStart, $lte: monthEnd } };
          break;

        case 'year':
          const yearStart = new Date();
          yearStart.setMonth(0, 1);
          yearStart.setHours(0, 0, 0, 0);
          const yearEnd = new Date(yearStart);
          yearEnd.setFullYear(yearEnd.getFullYear() + 1);
          yearEnd.setDate(0);
          yearEnd.setHours(23, 59, 59, 999);
          dateRange = { createdAt: { $gte: yearStart, $lte: yearEnd } };
          break;

        case 'custom':
          if (startDate && endDate) {
            dateRange = {
              createdAt: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
              }
            };
          }
          break;
      }
    }

    // إضافة adminId للفلتر
    const matchCondition = { adminId: adminId, ...dateRange };

    // 1. إجمالي عدد الطلبات (Total Orders)
    const totalOrders = await Invoice.countDocuments(matchCondition);

    // 2. إجمالي الإيرادات (Total Revenue) + متوسط سعر الطلب
    const revenueData = await Invoice.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          totalAfterDiscount: { $sum: '$finalAmount' },
          totalDiscounts: { $sum: '$discount.amount' },
          orderCount: { $sum: 1 }
        }
      }
    ]);

    const revenue = revenueData[0] || {
      totalRevenue: 0,
      totalAfterDiscount: 0,
      totalDiscounts: 0,
      orderCount: 0
    };

    // متوسط سعر الطلب
    const averageOrderValue = revenue.orderCount > 0 
      ? revenue.totalAfterDiscount / revenue.orderCount 
      : 0;

    // 3. حساب الأرباح والمصروفات (Profit & Expenses)
    const profitExpenseData = await Invoice.aggregate([
      { $match: matchCondition },
      { $unwind: '$items' },
      {
        $group: {
          _id: null,
          totalExpenses: {
            $sum: {
              $multiply: ['$items.quantity', '$items.originalPrice']
            }
          },
          totalProfit: {
            $sum: {
              $multiply: [
                '$items.quantity',
                { $subtract: ['$items.sellingPrice', '$items.originalPrice'] }
              ]
            }
          },
          totalItemsSold: { $sum: '$items.quantity' }
        }
      }
    ]);

    const profitExpense = profitExpenseData[0] || {
      totalExpenses: 0,
      totalProfit: 0,
      totalItemsSold: 0
    };

    // 4. إجمالي المصروفات من جميع المنتجات الموجودة للأدمن
    const allProductsExpense = await Product.aggregate([
      { $match: { adminId: adminId } },
      {
        $group: {
          _id: null,
          totalInventoryValue: {
            $sum: { $multiply: ['$quantity', '$originalPrice'] }
          },
          totalProducts: { $sum: 1 },
          totalInventoryItems: { $sum: '$quantity' }
        }
      }
    ]);

    const inventoryExpense = allProductsExpense[0] || {
      totalInventoryValue: 0,
      totalProducts: 0,
      totalInventoryItems: 0
    };

    // 5. أعلى الفواتير سعراً (Top Selling Orders)
    const topSellingOrders = await Invoice.find(matchCondition)
      .sort({ finalAmount: -1 })
      .limit(10)
      .populate('customerId', 'name phone')
      .select('invoiceNumber finalAmount totalAmount discount createdAt items')
      .lean();

    // إضافة تفاصيل المنتجات للفواتير
    for (let invoice of topSellingOrders) {
      const itemsWithDetails = await Promise.all(
        invoice.items.map(async (item) => {
          const product = await Product.findById(item.productId).select('name sku');
          return {
            ...item,
            productName: product?.name || 'منتج محذوف',
            productSku: product?.sku || 'N/A'
          };
        })
      );
      invoice.itemsWithDetails = itemsWithDetails;
    }

    // 6. إحصائيات إضافية مفيدة
    const additionalStats = {
      profitMargin: revenue.totalAfterDiscount > 0 
        ? ((profitExpense.totalProfit / revenue.totalAfterDiscount) * 100).toFixed(2)
        : 0,
      averageItemsPerOrder: totalOrders > 0 
        ? (profitExpense.totalItemsSold / totalOrders).toFixed(2)
        : 0,
      discountPercentage: revenue.totalRevenue > 0
        ? ((revenue.totalDiscounts / revenue.totalRevenue) * 100).toFixed(2)
        : 0
    };

    res.json({
      success: true,
      message: 'تم استرداد تحليلات لوحة التحكم بنجاح',
      data: {
        period: period,
        dateRange: period === 'custom' && startDate && endDate ? {
          startDate: new Date(startDate),
          endDate: new Date(endDate)
        } : null,
        
        // الإحصائيات الأساسية
        overview: {
          totalOrders: totalOrders,
          totalRevenue: revenue.totalRevenue,
          totalRevenueAfterDiscount: revenue.totalAfterDiscount,
          totalDiscounts: revenue.totalDiscounts,
          averageOrderValue: parseFloat(averageOrderValue.toFixed(2)),
          totalProfit: profitExpense.totalProfit,
          totalExpensesFromSales: profitExpense.totalExpenses,
          totalInventoryValue: inventoryExpense.totalInventoryValue,
          totalItemsSold: profitExpense.totalItemsSold
        },

        // إحصائيات متقدمة
        analytics: {
          profitMargin: parseFloat(additionalStats.profitMargin),
          averageItemsPerOrder: parseFloat(additionalStats.averageItemsPerOrder),
          discountPercentage: parseFloat(additionalStats.discountPercentage),
          inventoryCount: inventoryExpense.totalProducts,
          inventoryItems: inventoryExpense.totalInventoryItems
        },

        // أعلى الفواتير
        topSellingOrders: topSellingOrders.map(order => ({
          id: order._id,
          invoiceNumber: order.invoiceNumber,
          customer: order.customerId ? {
            name: order.customerId.name,
            phone: order.customerId.phone
          } : null,
          totalAmount: order.totalAmount,
          finalAmount: order.finalAmount,
          discount: order.discount,
          itemsCount: order.items.length,
          items: order.itemsWithDetails,
          date: order.createdAt
        }))
      }
    });

  } catch (error) {
    console.error('Get admin dashboard analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
};

module.exports = getAdminDashboardAnalytics;
