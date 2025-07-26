const Category = require('../../../models/Category');


module.exports = async (req, res) => {
  try {
    console.log('Received request body:', req.body);
    console.log('Authenticated user:', req.user);

    const { name } = req.body;
    if (!name) {
      console.error('Category name is missing');
      return res.status(400).json({ message: 'Category name is required' });
    }

    const category = new Category({
      name,
      adminId: req.user._id
    });
    console.log('Creating category:', category);

    await category.save();
    res.status(201).json({ message: 'Category created', category });
  } catch (err) {
    console.error('Error creating category:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
