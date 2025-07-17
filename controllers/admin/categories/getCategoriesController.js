const Category = require('../../../models/Category');

module.exports = async (req, res) => {
  try {
    const categories = await Category.find({ tenantId: req.user.tenantId });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
