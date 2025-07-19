const User = require('../../models/User');
const Tenant = require('../../models/Tenant');
const Subscription = require('../../models/Subscription');
const bcrypt = require('bcryptjs');
const mailSender = require('../../utils/mailSender');


module.exports = async (req, res) => {
  try {
    const { firstName, lastName, businessName, phone, email, password, confirmPassword } = req.body;

    if (!firstName || !lastName || !businessName || !phone || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already exists" });

    // إنشاء شركة جديدة
    const tenant = new Tenant({
      name: businessName,
      address: "-",
      phone: phone,
      createdAt: new Date()
    });
    await tenant.save();

    // إنشاء الأدمن وربطه بالشركة
    const hash = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const user = new User({
      name: `${firstName} ${lastName}`,
      email,
      password: hash,
      role: 'admin',
      tenantId: tenant._id,
      companyName: tenant.name,
      companyAddress: tenant.address,
      phone,
      isVerified: false,
      otp
    });
    await user.save();

    // ربط الأدمن بالـ tenant
    tenant.adminId = user._id;
    await tenant.save();

    // إنشاء اشتراك تلقائي (تجربة مجانية 30 يوم)
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + 30);
    const subscription = new Subscription({
      tenantId: tenant._id,
      plan: 'trial',
      price: 0,
      startDate: new Date(),
      endDate: trialEnd,
      status: 'pending',
      paymentConfirmed: false
    });
    await subscription.save();

    // إرسال رمز التحقق
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