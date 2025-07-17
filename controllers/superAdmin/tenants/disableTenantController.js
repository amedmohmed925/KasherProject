const Tenant = require('../../../models/Tenant');

module.exports = async (req, res) => {
  try {
    if (req.user.role !== 'superAdmin') return res.status(403).json({ message: 'Forbidden' });
    const { tenantId } = req.params;
    const tenant = await Tenant.findByIdAndUpdate(tenantId, { disabled: true }, { new: true });
    if (!tenant) return res.status(404).json({ message: 'Tenant not found' });
    res.json({ message: 'Tenant disabled', tenant });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
