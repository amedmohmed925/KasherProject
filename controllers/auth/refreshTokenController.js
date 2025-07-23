const jwt = require('jsonwebtoken');
const { REFRESH_TOKEN_SECRET, ACCESS_TOKEN_SECRET } = process.env;
const Token = require('../../models/Token'); // Adjust the path as necessary

const refreshTokenController = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is required' });
    }

    // Verify the refresh token
    const existingToken = await Token.findOne({ token: refreshToken });
    if (!existingToken) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }

    jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ message: 'Invalid refresh token' });
      }

      // Generate a new access token
      const accessToken = jwt.sign(
        { id: user.id, email: user.email, role: user.role, tenantId: user.tenantId },
        ACCESS_TOKEN_SECRET,
        { expiresIn: '15m' }
      );

      res.status(200).json({ token: accessToken });
    });
  } catch (error) {
    console.error('Error in refreshTokenController:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = refreshTokenController;
