const User = require('../../models/User');
const nodemailer = require('nodemailer');

module.exports = async (user, otp) => {
  // إرسال OTP عبر البريد
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: 'رمز التحقق من البريد الإلكتروني',
    html: `<p>رمز التحقق الخاص بك هو: <b>${otp}</b></p>`
  });
};
