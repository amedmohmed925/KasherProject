const Tenant = require('../../../models/Tenant');
const User = require('../../../models/User');
const Invoice = require('../../../models/Invoice');

module.exports = async (req, res) => {
  try {
    if (req.user.role !== 'superAdmin') return res.status(403).json({ message: 'Forbidden' });
    const { tenantId } = req.params;
    await User.deleteMany({ tenantId });
    await Invoice.deleteMany({ tenantId });
    await Tenant.findByIdAndDelete(tenantId);
    res.json({ message: 'Tenant deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
