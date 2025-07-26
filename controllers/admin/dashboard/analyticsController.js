const Product = require('../../../models/Product');
const Invoice = require('../../../models/Invoice');

const analyticsController = async (req, res) => {
  try {
    const adminId = req.user._id;
    
    // تحديد التواريخ
    const now = new Date();
    
    // بداية ونهاية اليوم
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    
    // بداية ونهاية الشهر
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    
    // بداية ونهاية السنة
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);

    // إجمالي الإيرادات يوميا
    const dailyRevenue = await Invoice.aggregate([
      { $match: { adminId, createdAt: { $gte: startOfDay, $lte: endOfDay } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    // إجمالي الإيرادات شهريا
    const monthlyRevenue = await Invoice.aggregate([
      { $match: { adminId, createdAt: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    // إجمالي الإيرادات سنويا
    const yearlyRevenue = await Invoice.aggregate([
      { $match: { adminId, createdAt: { $gte: startOfYear, $lte: endOfYear } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    // عدد المنتجات يوميا
    const dailyProducts = await Product.countDocuments({ 
      adminId, 
      createdAt: { $gte: startOfDay, $lte: endOfDay } 
    });

    // عدد المنتجات شهريا
    const monthlyProducts = await Product.countDocuments({ 
      adminId, 
      createdAt: { $gte: startOfMonth, $lte: endOfMonth } 
    });

    // عدد المنتجات سنويا
    const yearlyProducts = await Product.countDocuments({ 
      adminId, 
      createdAt: { $gte: startOfYear, $lte: endOfYear } 
    });

    // عدد الفواتير يوميا
    const dailyInvoices = await Invoice.countDocuments({ 
      adminId, 
      createdAt: { $gte: startOfDay, $lte: endOfDay } 
    });

    // عدد الفواتير شهريا
    const monthlyInvoices = await Invoice.countDocuments({ 
      adminId, 
      createdAt: { $gte: startOfMonth, $lte: endOfMonth } 
    });

    // عدد الفواتير سنويا
    const yearlyInvoices = await Invoice.countDocuments({ 
      adminId, 
      createdAt: { $gte: startOfYear, $lte: endOfYear } 
    });

    // عدد العملاء الفريدين يوميا
    const dailyCustomers = await Invoice.distinct('customer.name', { 
      adminId, 
      createdAt: { $gte: startOfDay, $lte: endOfDay } 
    });

    // عدد العملاء الفريدين شهريا
    const monthlyCustomers = await Invoice.distinct('customer.name', { 
      adminId, 
      createdAt: { $gte: startOfMonth, $lte: endOfMonth } 
    });

    // عدد العملاء الفريدين سنويا
    const yearlyCustomers = await Invoice.distinct('customer.name', { 
      adminId, 
      createdAt: { $gte: startOfYear, $lte: endOfYear } 
    });

    // إجمالي المخزون الحالي
    const totalInventory = await Product.aggregate([
      { $match: { adminId } },
      {
        $group: {
          _id: null,
          totalQuantity: { $sum: '$quantity' },
          totalValue: { $sum: { $multiply: ['$quantity', '$sellingPrice'] } }
        }
      }
    ]);

    res.status(200).json({
      revenue: {
        daily: dailyRevenue[0]?.total || 0,
        monthly: monthlyRevenue[0]?.total || 0,
        yearly: yearlyRevenue[0]?.total || 0
      },
      products: {
        daily: dailyProducts,
        monthly: monthlyProducts,
        yearly: yearlyProducts
      },
      invoices: {
        daily: dailyInvoices,
        monthly: monthlyInvoices,
        yearly: yearlyInvoices
      },
      customers: {
        daily: dailyCustomers.length,
        monthly: monthlyCustomers.length,
        yearly: yearlyCustomers.length
      },
      inventory: {
        totalQuantity: totalInventory[0]?.totalQuantity || 0,
        totalValue: totalInventory[0]?.totalValue || 0
      }
    });
  } catch (error) {
    console.error('Error in analyticsController:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = analyticsController;
