const User = require('../../models/User');
const Subscription = require('../../models/Subscription');
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

    // Create automatic 30-day trial subscription if none exists
    try {
      const existingSub = await Subscription.findOne({ adminId: user._id }).sort({ endDate: -1 });
      if (!existingSub) {
        const startDate = new Date();
        const endDate = new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000);
        await Subscription.create({
          adminId: user._id,
            plan: 'trial',
            price: 0,
            startDate,
            endDate,
            status: 'approved',
            paymentConfirmed: true,
            duration: 'trial'
        });
      }
    } catch (subErr) {
      console.error('Failed to create trial subscription automatically:', subErr.message);
      // Don't fail registration because of subscription creation issue
    }

    console.log('Sending verification email...');
    await mailSender(
      email,
      "رمز التحقق من البريد الإلكتروني",
      `<h1>مرحبًا بك!</h1><p>رمز التحقق الخاص بك هو: <b>${otp}</b></p>`
    );

  res.status(201).json({ message: "تم التسجيل بنجاح. تم تفعيل الفترة التجريبية المجانية لمدة 30 يوم. يرجى التحقق من بريدك الإلكتروني." });
  } catch (error) {
    console.error("Error in register:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};