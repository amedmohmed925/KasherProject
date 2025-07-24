const User = require('../../models/User');
const mailSender = require('../../utils/mailSender');

module.exports = async (req, res) => {
  try {
    const { email } = req.body;
    console.log('Received email:', email);
    if (!email) {
      console.error('Email is missing in the request body');
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.error('User not found for email:', email);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('User found:', user);

    // Generate reset code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('Generated reset code:', resetCode);

    // Use Mongoose's `updateOne` to only update the `otp` field
    await User.updateOne({ _id: user._id }, { otp: resetCode });
    console.log('OTP updated for user:', user._id);

    await mailSender(
      email,
      'Password Reset Code',
      `<p>Your password reset code is: <b>${resetCode}</b></p>`
    );
    console.log('Reset code email sent to:', email);
    res.json({ message: 'Reset code sent to your email' });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
