const Invoice = require('../../models/Invoice');
const User = require('../../models/User');

module.exports = async (req, res) => {
  try {
    if (req.user.role !== 'superAdmin') {
      return res.status(403).json({ message: 'غير مسموح' });
    }

    const { id: adminId } = req.params;
    const { 
      customerName,
      minAmount,
      maxAmount,
      startDate,
      endDate,
      page = 1, 
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // التحقق من وجود الأدمن
    const admin = await User.findOne({ _id: adminId, role: 'admin' });
    if (!admin) {
      return res.status(404).json({ message: 'الأدمن غير موجود' });
    }

    // بناء فلتر البحث
    let filter = { adminId };

    // فلترة حسب اسم العميل
    if (customerName) {
      filter['customer.name'] = { $regex: customerName, $options: 'i' };
    }

    // فلترة حسب المبلغ
    if (minAmount || maxAmount) {
      filter.totalAmount = {};
      if (minAmount) filter.totalAmount.$gte = parseFloat(minAmount);
      if (maxAmount) filter.totalAmount.$lte = parseFloat(maxAmount);
    }

    // فلترة حسب التاريخ
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // تحديد ترتيب البيانات
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // حساب الصفحات
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // جلب الفواتير
    const invoices = await Invoice.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // حساب العدد الإجمالي
    const totalInvoices = await Invoice.countDocuments(filter);
    const totalPages = Math.ceil(totalInvoices / parseInt(limit));

    // إحصائيات الفواتير لهذا الأدمن
    const stats = await Invoice.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalInvoices: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          averageInvoiceValue: { $avg: '$totalAmount' },
          maxInvoiceValue: { $max: '$totalAmount' },
          minInvoiceValue: { $min: '$totalAmount' },
          totalItems: { $sum: { $size: '$items' } }
        }
      }
    ]);

    // أكثر المنتجات مبيعاً لهذا الأدمن
    const topProducts = await Invoice.aggregate([
      { $match: filter },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          productName: { $first: '$items.name' },
          sku: { $first: '$items.sku' },
          totalSold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.total' },
          timesOrdered: { $sum: 1 }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 }
    ]);

    // أكثر العملاء شراءً لهذا الأدمن
    const topCustomers = await Invoice.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$customer.name',
          totalPurchases: { $sum: '$totalAmount' },
          invoiceCount: { $sum: 1 },
          lastPurchase: { $max: '$createdAt' }
        }
      },
      { $sort: { totalPurchases: -1 } },
      { $limit: 10 }
    ]);

    // إحصائيات شهرية لهذا الأدمن
    const monthlyStats = await Invoice.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          monthlyRevenue: { $sum: '$totalAmount' },
          monthlyInvoices: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    // إحصائيات يومية للرسم البياني
    const dailyStats = await Invoice.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          dailyRevenue: { $sum: '$totalAmount' },
          dailyInvoices: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1, '_id.day': -1 } },
      { $limit: 30 }
    ]);

    res.json({
      success: true,
      admin: {
        id: admin._id,
        firstName: admin.firstName,
        lastName: admin.lastName,
        companyName: admin.companyName,
        email: admin.email
      },
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalInvoices,
        limit: parseInt(limit),
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1
      },
      filters: {
        customerName,
        amountRange: { minAmount, maxAmount },
        dateRange: { startDate, endDate }
      },
      stats: stats[0] || {
        totalInvoices: 0,
        totalRevenue: 0,
        averageInvoiceValue: 0,
        maxInvoiceValue: 0,
        minInvoiceValue: 0,
        totalItems: 0
      },
      topProducts,
      topCustomers,
      monthlyStats,
      dailyStats,
      invoices
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
