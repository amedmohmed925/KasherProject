const User = require('../../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = async (req, res) => {
  try {
    const { email, password } = req.body;

    // التحقق من وجود الإيميل وكلمة السر
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // التحقق من وجود JWT_SECRET
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not defined in .env');
      return res.status(500).json({ message: 'Server configuration error: JWT_SECRET missing' });
    }

    // البحث عن المستخدم
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // التحقق من كلمة السر
    if (!user.password) {
      return res.status(500).json({ message: 'User password is missing or corrupted' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // توليد توكن JWT
    const token = jwt.sign(
      { id: user._id, role: user.role, tenantId: user.tenantId },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // تحويل المستخدم إلى كائن JSON واستثناء حقل password
    const userData = user.toJSON();
    delete userData.password;

    // إرجاع التوكن وبيانات المستخدم الكاملة
    res.status(200).json({
      token,
      user: userData
    });
  } catch (error) {
    console.error('Error in login:', error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};