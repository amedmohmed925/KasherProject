const Subscription = require('../models/Subscription');
const moment = require('moment');

// هذا الميدل وير يتحقق من صلاحية الاشتراك (تجربة أو مدفوع)
module.exports = async (req, res, next) => {
  try {
    // فقط للأدمن
    if (!req.user || req.user.role !== 'admin') {
      return next();
    }
    
    // جلب آخر اشتراك للأدمن
    const subscription = await Subscription.findOne({ adminId: req.user._id })
      .sort({ endDate: -1 });
      
    if (!subscription) {
      return res.status(403).json({ message: 'No active subscription. Please subscribe first.' });
    }
    
    const now = moment();
    // Check subscription validity
    if (now.isAfter(subscription.endDate)) {
      if (subscription.plan === 'trial') {
        return res.status(403).json({ message: 'Your free trial has expired. Please subscribe to continue.' });
      } else {
        return res.status(403).json({ message: 'Your subscription has expired. Please renew your subscription.' });
      }
    }
    
    if (subscription.status !== 'approved') {
      return res.status(403).json({ message: 'Your subscription is not approved yet.' });
    }
    
    next();
  } catch (error) {
    console.error('Subscription check error:', error);
    res.status(500).json({ message: 'Subscription check error', error: error.message });
  }
};
