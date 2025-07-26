const Subscription = require('../../../models/Subscription');
const User = require('../../../models/User');

// Get all subscriptions with admin info
module.exports = async (req, res) => {
  try {
    const subs = await Subscription.find({ adminId: req.user._id });
    const result = await Promise.all(subs.map(async (sub) => {
      const admin = await User.findOne({ _id: sub.adminId, role: 'admin' });
      return {
        subscription: {
          id: sub._id,
          plan: sub.plan,
          price: sub.price,
          startDate: sub.startDate,
          endDate: sub.endDate,
          status: sub.status,
          paymentConfirmed: sub.paymentConfirmed,
          receiptImage: sub.receiptImage,
          paidAmountText: sub.paidAmountText,
          duration: sub.duration,
          customNotes: sub.customNotes,
          receiptFileName: sub.receiptFileName,
          createdAt: sub.createdAt
        },
        admin: admin ? {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          phone: admin.phone,
          companyName: admin.companyName,
          companyAddress: admin.companyAddress
        } : null
      };
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
