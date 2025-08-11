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
      // Allow implicit trial based on user account creation date (30 days)
      const userCreatedAt = req.user.createdAt ? new Date(req.user.createdAt) : null;
      if (userCreatedAt) {
        const nowDate = new Date();
        const diffDays = Math.floor((nowDate - userCreatedAt) / (1000 * 60 * 60 * 24));
        if (diffDays < 30) {
          // Treat as active trial without stored subscription
          req.subscription = {
            plan: 'trial',
            status: 'approved',
            startDate: userCreatedAt,
            endDate: new Date(userCreatedAt.getTime() + 30 * 24 * 60 * 60 * 1000)
          };
          return next();
        }
      }
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
    
  req.subscription = subscription;
  next();
  } catch (error) {
    console.error('Subscription check error:', error);
    res.status(500).json({ message: 'Subscription check error', error: error.message });
  }
};
