const Category = require('../../../models/Category');

module.exports = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Category name is required' });
    const category = await Category.findOneAndUpdate(
      { _id: id, tenantId: req.user.tenantId },
      { name },
      { new: true }
    );
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json({ message: 'Category updated', category });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
