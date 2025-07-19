const Subscription = require('../../models/Subscription');
const Tenant = require('../../models/Tenant');
const User = require('../../models/User');

// Get all subscriptions with tenant and admin info
module.exports = async (req, res) => {
  try {
    const subs = await Subscription.find().populate('tenantId');
    const result = await Promise.all(subs.map(async (sub) => {
      const admin = await User.findOne({ tenantId: sub.tenantId._id, role: 'admin' });
      return {
        subscription: sub,
        tenant: sub.tenantId,
        admin: admin ? { name: admin.name, email: admin.email, phone: admin.phone } : null
      };
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
