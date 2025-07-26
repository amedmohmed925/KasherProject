const Product = require('../../../models/Product');
const Category = require('../../../models/Category');

module.exports = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, sku, originalPrice, sellingPrice, quantity, categoryId, description, image } = req.body;
    
    // إذا تم تحديث الفئة، تحقق من وجودها
    if (categoryId) {
      const category = await Category.findOne({ _id: categoryId, adminId: req.user._id });
      if (!category) {
        return res.status(400).json({ message: 'الفئة المحددة غير موجودة أو لا تخصك' });
      }
    }
    
    const updateData = { updatedAt: Date.now() };
    
    // إضافة الحقول المطلوب تحديثها فقط
    if (name !== undefined) updateData.name = name;
    if (sku !== undefined) updateData.sku = sku;
    if (originalPrice !== undefined) updateData.originalPrice = originalPrice;
    if (sellingPrice !== undefined) updateData.sellingPrice = sellingPrice;
    if (quantity !== undefined) updateData.quantity = quantity;
    if (categoryId !== undefined) updateData.categoryId = categoryId;
    if (description !== undefined) updateData.description = description;
    if (image !== undefined) updateData.image = image;
    
    const product = await Product.findOneAndUpdate(
      { _id: id, adminId: req.user._id },
      updateData,
      { new: true }
    ).populate('categoryId', 'name');
    
    if (!product) return res.status(404).json({ message: 'المنتج غير موجود' });
    res.json({ message: 'تم تحديث المنتج بنجاح', product });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'رمز المنتج (SKU) يجب أن يكون فريد' });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
