const Invoice = require('../../models/Invoice');
const User = require('../../models/User');

module.exports = async (req, res) => {
  try {
    if (req.user.role !== 'superAdmin') {
      return res.status(403).json({ message: 'غير مسموح' });
    }

    const { 
      adminId, 
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

    // بناء فلتر البحث
    let filter = {};

    // فلترة حسب الأدمن
    if (adminId) {
      filter.adminId = adminId;
    }

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

    // جلب الفواتير مع معلومات الأدمن
    const invoices = await Invoice.find(filter)
      .populate('adminId', 'firstName lastName companyName email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // حساب العدد الإجمالي
    const totalInvoices = await Invoice.countDocuments(filter);
    const totalPages = Math.ceil(totalInvoices / parseInt(limit));

    // إحصائيات إضافية
    const stats = await Invoice.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalInvoices: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          averageInvoiceValue: { $avg: '$totalAmount' },
          maxInvoiceValue: { $max: '$totalAmount' },
          minInvoiceValue: { $min: '$totalAmount' }
        }
      }
    ]);

    // إحصائيات حسب الأدمن
    const adminStats = await Invoice.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$adminId',
          invoiceCount: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          averageValue: { $avg: '$totalAmount' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'admin'
        }
      },
      {
        $project: {
          invoiceCount: 1,
          totalRevenue: 1,
          averageValue: 1,
          admin: { $arrayElemAt: ['$admin', 0] }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 }
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

    // معلومات الأدمن المتاحين للفلترة
    const admins = await User.find({ role: 'admin' }, 'firstName lastName companyName email');

    res.json({
      success: true,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalInvoices,
        limit: parseInt(limit),
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1
      },
      filters: {
        adminId,
        customerName,
        amountRange: { minAmount, maxAmount },
        dateRange: { startDate, endDate }
      },
      stats: stats[0] || {
        totalInvoices: 0,
        totalRevenue: 0,
        averageInvoiceValue: 0,
        maxInvoiceValue: 0,
        minInvoiceValue: 0
      },
      adminStats,
      dailyStats,
      invoices,
      availableAdmins: admins
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
