const User = require('../../models/User');
const bcrypt = require('bcryptjs');

module.exports = async (req, res) => {
  try {
    // التحقق من أن المستخدم أدمن
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'غير مسموح' });
    }

    const { firstName, lastName, companyName, companyAddress, phone, currentPassword, newPassword } = req.body;

    // البحث عن الأدمن
    const admin = await User.findById(req.user._id);
    if (!admin) {
      return res.status(404).json({ message: 'الأدمن غير موجود' });
    }

    // تحديث البيانات الأساسية
    const updateData = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (companyName !== undefined) updateData.companyName = companyName;
    if (companyAddress !== undefined) updateData.companyAddress = companyAddress;
    if (phone !== undefined) updateData.phone = phone;

    // تحديث كلمة المرور إذا تم إرسالها
    if (newPassword && currentPassword) {
      // التحقق من كلمة المرور الحالية
      const isValidPassword = await bcrypt.compare(currentPassword, admin.password);
      if (!isValidPassword) {
        return res.status(400).json({ message: 'كلمة المرور الحالية غير صحيحة' });
      }

      // تشفير كلمة المرور الجديدة
      updateData.password = await bcrypt.hash(newPassword, 10);
    }

    // تحديث البيانات
    const updatedAdmin = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'تم تحديث البيانات بنجاح',
      admin: updatedAdmin
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
