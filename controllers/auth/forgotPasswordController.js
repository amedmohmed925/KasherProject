const User = require('../../models/User');
const mailSender = require('../../utils/mailSender');

module.exports = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    // Generate reset code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = resetCode;
    await user.save();
    await mailSender(
      email,
      'Password Reset Code',
      `<p>Your password reset code is: <b>${resetCode}</b></p>`
    );
    res.json({ message: 'Reset code sent to your email' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
