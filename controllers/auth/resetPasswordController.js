const User = require('../../models/User');
const bcrypt = require('bcryptjs');

module.exports = async (req, res) => {
  try {
    console.log('Received request body:', req.body);
    const { email, otp, newPassword, confirmNewPassword } = req.body;
    if (!email || !otp || !newPassword || !confirmNewPassword) {
      console.error('Missing required fields:', { email, otp, newPassword, confirmNewPassword });
      return res.status(400).json({ message: 'All fields are required' });
    }
    if (newPassword !== confirmNewPassword) {
      console.error('Passwords do not match:', { newPassword, confirmNewPassword });
      return res.status(400).json({ message: 'Passwords do not match' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      console.error('User not found for email:', email);
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.otp !== otp) {
      console.error('Invalid or expired OTP for user:', { email, otp });
      return res.status(400).json({ message: 'Invalid or expired code' });
    }
    // Use `updateOne` to update only the password and clear the OTP
    await User.updateOne(
      { _id: user._id },
      { password: await bcrypt.hash(newPassword, 10), otp: undefined }
    );
    console.log('Password updated successfully for user:', email);
    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
