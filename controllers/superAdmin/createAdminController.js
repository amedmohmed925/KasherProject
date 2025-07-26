const User = require('../../models/User');

module.exports = async (req, res) => {
  try {
    if (req.user.role !== 'superAdmin') return res.status(403).json({ message: 'Forbidden' });
    
    const { firstName, lastName, companyName, companyAddress, phone, email, password } = req.body;
    
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'البريد الإلكتروني موجود بالفعل' });
    
    const bcrypt = require('bcryptjs');
    const hash = await bcrypt.hash(password, 10);
    
    const user = new User({ 
      firstName, 
      lastName, 
      companyName, 
      companyAddress, 
      phone, 
      email, 
      password: hash, 
      role: 'admin',
      isVerified: true // السوبر أدمن ينشئ أدمن مفعل مباشرة
    });
    
    await user.save();
    
    // إرجاع البيانات بدون كلمة المرور
    const { password: _, ...adminData } = user.toObject();
    res.status(201).json({ 
      message: 'تم إنشاء الأدمن بنجاح', 
      admin: adminData 
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
