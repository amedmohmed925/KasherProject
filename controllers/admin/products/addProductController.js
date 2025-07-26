const Product = require('../../../models/Product');
const Category = require('../../../models/Category');
const cloudinary = require('../../../utils/cloudinary');

module.exports = async (req, res) => {
  try {
    const { name, sku, originalPrice, sellingPrice, quantity, categoryId, description } = req.body;
    let imageUrl = '';
    
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    if (!name || !sku || !originalPrice || !sellingPrice || !quantity || !categoryId) {
      return res.status(400).json({ message: 'جميع الحقول المطلوبة يجب أن تُقدم (الاسم، SKU، السعر الأصلي، سعر البيع، الكمية، الفئة)' });
    }

    // التحقق من وجود الفئة وأنها تخص نفس الأدمن
    const category = await Category.findOne({ _id: categoryId, adminId: req.user._id });
    if (!category) {
      return res.status(400).json({ message: 'الفئة المحددة غير موجودة أو لا تخصك' });
    }

    // رفع الصورة على Cloudinary إذا تم إرسال صورة
    if (req.file) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'kasher_products',
          resource_type: 'image',
          transformation: [
            { width: 500, height: 500, crop: 'limit' },
            { quality: 'auto' }
          ]
        });
        imageUrl = result.secure_url;
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        return res.status(500).json({ message: 'فشل في رفع الصورة' });
      }
    }

    const product = new Product({
      adminId: req.user._id,
      name,
      sku,
      originalPrice,
      sellingPrice,
      quantity,
      categoryId,
      description,
      image: imageUrl
    });

    await product.save();
    
    // إرجاع المنتج مع معلومات الفئة
    const savedProduct = await Product.findById(product._id).populate('categoryId', 'name');
    
    res.status(201).json({ message: 'تم إنشاء المنتج بنجاح', product: savedProduct });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'رمز المنتج (SKU) موجود مسبقاً' });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
