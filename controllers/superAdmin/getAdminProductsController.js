const Product = require('../../models/Product');
const User = require('../../models/User');
const Category = require('../../models/Category');

module.exports = async (req, res) => {
  try {
    if (req.user.role !== 'superAdmin') {
      return res.status(403).json({ message: 'غير مسموح' });
    }

    const { id: adminId } = req.params;
    const { 
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

    // التحقق من وجود الأدمن
    const admin = await User.findOne({ _id: adminId, role: 'admin' });
    if (!admin) {
      return res.status(404).json({ message: 'الأدمن غير موجود' });
    }

    // بناء فلتر البحث
    let filter = { adminId };

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

    // جلب المنتجات مع معلومات الفئة
    const products = await Product.find(filter)
      .populate('categoryId', 'name')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // حساب العدد الإجمالي
    const totalProducts = await Product.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / parseInt(limit));

    // إحصائيات المنتجات لهذا الأدمن
    const stats = await Product.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalValue: { $sum: { $multiply: ['$quantity', '$sellingPrice'] } },
          totalOriginalValue: { $sum: { $multiply: ['$quantity', '$originalPrice'] } },
          averageSellingPrice: { $avg: '$sellingPrice' },
          averageOriginalPrice: { $avg: '$originalPrice' },
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

    // إحصائيات حسب الفئات لهذا الأدمن
    const categoryStats = await Product.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$categoryId',
          productCount: { $sum: 1 },
          totalValue: { $sum: { $multiply: ['$quantity', '$sellingPrice'] } },
          totalQuantity: { $sum: '$quantity' }
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'category'
        }
      },
      {
        $project: {
          productCount: 1,
          totalValue: 1,
          totalQuantity: 1,
          categoryName: { $arrayElemAt: ['$category.name', 0] }
        }
      },
      { $sort: { productCount: -1 } }
    ]);

    // فئات هذا الأدمن للفلترة
    const adminCategories = await Category.find({ adminId }, 'name');

    // حساب الربح المتوقع
    const profitCalculation = stats[0] ? {
      expectedProfit: stats[0].totalValue - stats[0].totalOriginalValue,
      profitMargin: stats[0].totalOriginalValue > 0 ? 
        ((stats[0].totalValue - stats[0].totalOriginalValue) / stats[0].totalOriginalValue * 100).toFixed(2) + '%' : '0%'
    } : { expectedProfit: 0, profitMargin: '0%' };

    res.json({
      success: true,
      admin: {
        id: admin._id,
        firstName: admin.firstName,
        lastName: admin.lastName,
        companyName: admin.companyName,
        email: admin.email
      },
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalProducts,
        limit: parseInt(limit),
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1
      },
      filters: {
        categoryId,
        search,
        priceRange: { minPrice, maxPrice },
        quantityRange: { minQuantity, maxQuantity }
      },
      stats: {
        ...(stats[0] || {
          totalProducts: 0,
          totalValue: 0,
          totalOriginalValue: 0,
          averageSellingPrice: 0,
          averageOriginalPrice: 0,
          totalQuantity: 0,
          lowStockCount: 0,
          outOfStockCount: 0
        }),
        ...profitCalculation
      },
      categoryStats,
      products,
      availableCategories: adminCategories
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
