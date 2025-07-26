const Product = require('../../models/Product');
const User = require('../../models/User');
const Category = require('../../models/Category');

module.exports = async (req, res) => {
  try {
    if (req.user.role !== 'superAdmin') {
      return res.status(403).json({ message: 'غير مسموح' });
    }

    const { 
      adminId, 
      categoryId, 
      search, 
      minPrice, 
      maxPrice, 
      minQuantity, 
      maxQuantity,
      page = 1, 
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // بناء فلتر البحث
    let filter = {};

    // فلترة حسب الأدمن
    if (adminId) {
      filter.adminId = adminId;
    }

    // فلترة حسب الفئة
    if (categoryId) {
      filter.categoryId = categoryId;
    }

    // البحث في اسم المنتج أو SKU أو الوصف
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // فلترة حسب السعر
    if (minPrice || maxPrice) {
      filter.sellingPrice = {};
      if (minPrice) filter.sellingPrice.$gte = parseFloat(minPrice);
      if (maxPrice) filter.sellingPrice.$lte = parseFloat(maxPrice);
    }

    // فلترة حسب الكمية
    if (minQuantity || maxQuantity) {
      filter.quantity = {};
      if (minQuantity) filter.quantity.$gte = parseInt(minQuantity);
      if (maxQuantity) filter.quantity.$lte = parseInt(maxQuantity);
    }

    // تحديد ترتيب البيانات
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // حساب الصفحات
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // جلب المنتجات مع معلومات الأدمن والفئة
    const products = await Product.find(filter)
      .populate('adminId', 'firstName lastName companyName email')
      .populate('categoryId', 'name')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // حساب العدد الإجمالي
    const totalProducts = await Product.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / parseInt(limit));

    // إحصائيات إضافية
    const stats = await Product.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalValue: { $sum: { $multiply: ['$quantity', '$sellingPrice'] } },
          averagePrice: { $avg: '$sellingPrice' },
          totalQuantity: { $sum: '$quantity' },
          lowStockCount: {
            $sum: { $cond: [{ $lte: ['$quantity', 10] }, 1, 0] }
          },
          outOfStockCount: {
            $sum: { $cond: [{ $eq: ['$quantity', 0] }, 1, 0] }
          }
        }
      }
    ]);

    // معلومات الأدمن المتاحين للفلترة
    const admins = await User.find({ role: 'admin' }, 'firstName lastName companyName email');

    // معلومات الفئات المتاحة للفلترة
    const categories = await Category.find({}, 'name adminId').populate('adminId', 'firstName lastName companyName');

    res.json({
      success: true,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalProducts,
        limit: parseInt(limit),
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1
      },
      filters: {
        adminId,
        categoryId,
        search,
        priceRange: { minPrice, maxPrice },
        quantityRange: { minQuantity, maxQuantity }
      },
      stats: stats[0] || {
        totalProducts: 0,
        totalValue: 0,
        averagePrice: 0,
        totalQuantity: 0,
        lowStockCount: 0,
        outOfStockCount: 0
      },
      products,
      availableFilters: {
        admins,
        categories
      }
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
