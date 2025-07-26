const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const mailSender = require('../../utils/mailSender');


module.exports = async (req, res) => {
  try {
    console.log('Received request body:', req.body);
    const { firstName, lastName, phone, email, password, confirmPassword, companyName, companyAddress } = req.body;

    if (!firstName || !lastName || !phone || !email || !password || !confirmPassword || !companyName || !companyAddress) {
      console.log('Validation failed: Missing fields');
      return res.status(400).json({ message: "جميع الحقول مطلوبة (الاسم الأول، الاسم الأخير، الهاتف، البريد الإلكتروني، كلمة المرور، تأكيد كلمة المرور، اسم الشركة، عنوان الشركة)" });
    }

    if (password !== confirmPassword) {
      console.log('Validation failed: Passwords do not match');
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      console.log('Validation failed: Email already exists');
      return res.status(400).json({ message: "Email already exists" });
    }

    console.log('Creating user...');
    const hash = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const user = new User({
      firstName,
      lastName,
      email,
      password: hash,
      role: 'admin',
      phone,
      companyName,
      companyAddress,
      isVerified: false,
      otp
    });
    await user.save();

    console.log('Sending verification email...');
    await mailSender(
      email,
      "رمز التحقق من البريد الإلكتروني",
      `<h1>مرحبًا بك!</h1><p>رمز التحقق الخاص بك هو: <b>${otp}</b></p>`
    );

    res.status(201).json({ message: "تم التسجيل بنجاح. يرجى التحقق من بريدك الإلكتروني." });
  } catch (error) {
    console.error("Error in register:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};