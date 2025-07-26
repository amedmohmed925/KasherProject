const User = require('../../models/User');

module.exports = async (req, res) => {
  try {
    // التحقق من أن المستخدم أدمن
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'غير مسموح' });
    }

    // جلب بيانات الأدمن الحالي
    const admin = await User.findById(req.user._id).select('-password');
    
    if (!admin) {
      return res.status(404).json({ message: 'الأدمن غير موجود' });
    }

    res.json({
      success: true,
      admin: {
        id: admin._id,
        firstName: admin.firstName,
        lastName: admin.lastName,
        companyName: admin.companyName,
        companyAddress: admin.companyAddress,
        email: admin.email,
        phone: admin.phone,
        role: admin.role,
        isVerified: admin.isVerified,
        createdAt: admin.createdAt
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
