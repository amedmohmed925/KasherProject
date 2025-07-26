const Category = require('../../../models/Category');

module.exports = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findOneAndDelete({ _id: id, adminId: req.user._id });
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
