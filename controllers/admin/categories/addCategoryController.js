const Category = require('../../../models/Category');


module.exports = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Category name is required' });
    const category = new Category({
      name,
      tenantId: req.user.tenantId
    });
    await category.save();
    res.status(201).json({ message: 'Category created', category });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
