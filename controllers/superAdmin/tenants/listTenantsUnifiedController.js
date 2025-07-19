const Tenant = require('../../../models/Tenant');
const Subscription = require('../../../models/Subscription');
const User = require('../../../models/User');
const Invoice = require('../../../models/Invoice');

module.exports = async (req, res) => {
  try {
    // التحقق إن المستخدم سوبر أدمن
    if (req.user.role !== 'superAdmin') {
      return res.status(403).json({ message: 'Forbidden: Super Admin access required' });
    }

    // جلب المعلمات من query (pagination وتصفية)
    const { page = 1, limit = 10, status, plan, include = '' } = req.query;
    const skip = (page - 1) * limit;

    // بناء استعلام الـ tenants
    const tenants = await Tenant.find()
      .populate('adminId', 'name email phone')
      .skip(skip)
      .limit(parseInt(limit));

    // جلب البيانات لكل tenant
    const result = await Promise.all(tenants.map(async (tenant) => {
      // جلب الاشتراك
      let subscriptionQuery = { tenantId: tenant._id };
      if (status) subscriptionQuery.status = status;
      if (plan) subscriptionQuery.plan = plan;
      const subscription = await Subscription.findOne(subscriptionQuery);

      // جلب إحصائيات الفواتير إذا مطلوب (include=stats)
      let stats = {};
      if (include.includes('stats')) {
        const invoices = await Invoice.find({ tenantId: tenant._id }).select('totalAmount');
        stats.totalProfit = invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
        stats.invoiceCount = invoices.length;
      }

      return {
        tenantId: tenant._id,
        name: tenant.name,
        address: tenant.address,
        createdAt: tenant.createdAt,
        admin: tenant.adminId ? {
          id: tenant.adminId._id,
          name: tenant.adminId.name,
          email: tenant.adminId.email,
          phone: tenant.adminId.phone
        } : null,
        subscription: subscription ? {
          plan: subscription.plan,
          price: subscription.price,
          status: subscription.status,
          paymentConfirmed: subscription.paymentConfirmed,
          startDate: subscription.startDate,
          endDate: subscription.endDate
        } : null,
        ...(include.includes('stats') && { stats })
      };
    }));

    // إرجاع النتيجة مع معلومات الباجينيشن
    const totalTenants = await Tenant.countDocuments();
    res.json({
      tenants: result,
      pagination: {
        total: totalTenants,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalTenants / limit)
      }
    });
  } catch (err) {
    console.error('Error in listTenantsUnified:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};