const Product = require('../../../models/Product');

module.exports = async (req, res) => {
  try {
    console.log('Authenticated user:', req.user);
    console.log('Fetching products for adminId:', req.user._id);

    const products = await Product.find({ adminId: req.user._id });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
