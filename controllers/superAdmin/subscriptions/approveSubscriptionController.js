const Subscription = require('../../../models/Subscription');
const User = require('../../../models/User');
const mailSender = require('../../../utils/mailSender');

module.exports = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    const { subscriptionId } = req.params;

    // التحقق من الحالة
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be "approved" or "rejected"' });
    }

    // التحقق من وجود سبب الرفض إذا كان الـ status مرفوض
    if (status === 'rejected' && !rejectionReason) {
      return res.status(400).json({ message: 'Rejection reason is required for rejected status' });
    }

    // البحث عن الاشتراك
    const subscription = await Subscription.findById(subscriptionId);
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    // التحقق إن المستخدم سوبر أدمن
    if (req.user.role !== 'superAdmin') {
      return res.status(403).json({ message: 'Forbidden: Super Admin access required' });
    }

    // تحديث حالة الاشتراك فقط دون التحقق من الحقول الأخرى
    subscription.set({
      status,
      paymentConfirmed: status === 'approved'
    });
    await subscription.save();


    if (status === 'rejected') {
      const admin = await User.findOne({ _id: subscription.adminId, role: 'admin' });
      if (admin && admin.email) {
        await mailSender(
          admin.email,
          'حالة طلب الاشتراك',
          `<h1>طلب الاشتراك</h1><p>تم رفض طلب الاشتراك الخاص بك. السبب: ${rejectionReason}</p><p>يرجى التواصل مع فريق الدعم لمزيد من التفاصيل.</p>`
        );
      } else {
        console.warn('Admin email not defined, skipping email to admin.');
      }
    }

    res.status(200).json({ message: `Subscription ${status} successfully` });
  } catch (error) {
    console.error('Error in approveSubscription:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};