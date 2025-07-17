const Tenant = require('../../../models/Tenant');
const Invoice = require('../../../models/Invoice');

module.exports = async (req, res) => {
  try {
    if (req.user.role !== 'superAdmin') return res.status(403).json({ message: 'Forbidden' });
    const tenants = await Tenant.find();
    // Get stats for each tenant
    const stats = await Promise.all(tenants.map(async (tenant) => {
      const invoices = await Invoice.find({ tenantId: tenant._id });
      const totalProfit = invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
      return {
        tenantId: tenant._id,
        name: tenant.name,
        address: tenant.address,
        invoices,
        totalProfit
      };
    }));
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
