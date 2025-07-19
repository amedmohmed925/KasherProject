const Blacklist = require('../../models/Blacklist'); // افترض إن فيه موديل لتخزين التوكنات المبطلة

module.exports = async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(400).json({ message: 'No token provided' });
    }

    // إضافة التوكن إلى Blacklist
    const blacklistEntry = new Blacklist({
      token,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // التوكن بيبقى مبطل لمدة 24 ساعة
    });
    await blacklistEntry.save();

    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error('Error in logout:', err);
    res.status(500).json({ message: 'Server error' });
  }
};