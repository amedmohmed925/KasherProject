const jwt = require('jsonwebtoken');
const Tenant = require('../../models/Tenant');
require('dotenv').config();

module.exports = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ message: 'Token is required' });
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ message: 'Invalid or expired invitation token' });
    }
    const tenant = await Tenant.findById(payload.tenantId);
    if (!tenant) return res.status(404).json({ message: 'Company not found' });
    res.json({
      email: payload.email,
      tenantId: payload.tenantId,
      companyName: tenant.name,
      companyAddress: tenant.address,
      name: payload.name || ''
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
