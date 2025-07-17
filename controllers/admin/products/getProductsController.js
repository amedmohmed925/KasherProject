const Product = require('../../../models/Product');

module.exports = async (req, res) => {
  try {
    const products = await Product.find({ tenantId: req.user.tenantId });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
