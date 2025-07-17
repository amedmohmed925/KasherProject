const Tenant = require('../../../../models/Tenant');
const User = require('../../../../models/User');
const Invoice = require('../../../../models/Invoice');

module.exports = async (req, res) => {
  try {
    if (req.user.role !== 'superAdmin') return res.status(403).json({ message: 'Forbidden' });
    const { tenantId } = req.params;
    const tenant = await Tenant.findById(tenantId);
    if (!tenant) return res.status(404).json({ message: 'Tenant not found' });
    const employees = await User.find({ tenantId, role: 'employee' });
    const invoices = await Invoice.find({ tenantId });
    res.json({ tenant, employees, invoices });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
