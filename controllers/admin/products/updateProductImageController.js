const Product = require('../../../models/Product');
const cloudinary = require('../../../utils/cloudinary');

module.exports = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!req.file) {
      return res.status(400).json({ message: 'يجب إرسال صورة' });
    }

    // البحث عن المنتج والتأكد أنه يخص الأدمن
    const product = await Product.findOne({ _id: id, adminId: req.user._id });
    if (!product) {
      return res.status(404).json({ message: 'المنتج غير موجود' });
    }

    try {
      // رفع الصورة الجديدة على Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'kasher_products',
        resource_type: 'image',
        transformation: [
          { width: 500, height: 500, crop: 'limit' },
          { quality: 'auto' }
        ]
      });

      // حذف الصورة القديمة من Cloudinary إذا كانت موجودة
      if (product.image) {
        try {
          // استخراج public_id من URL الصورة القديمة
          const publicId = product.image.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(`kasher_products/${publicId}`);
        } catch (deleteError) {
          console.log('فشل في حذف الصورة القديمة:', deleteError);
          // لا نوقف العملية إذا فشل حذف الصورة القديمة
        }
      }

      // تحديث المنتج بالصورة الجديدة
      const updatedProduct = await Product.findByIdAndUpdate(
        id,
        { 
          image: result.secure_url,
          updatedAt: Date.now()
        },
        { new: true }
      ).populate('categoryId', 'name');

      res.json({ 
        message: 'تم تحديث صورة المنتج بنجاح', 
        product: updatedProduct 
      });

    } catch (uploadError) {
      console.error('Cloudinary upload error:', uploadError);
      return res.status(500).json({ message: 'فشل في رفع الصورة' });
    }

  } catch (err) {
    console.error('Error updating product image:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
