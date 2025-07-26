const Product = require('../../../models/Product');

module.exports = async (req, res) => {
  try {
    const adminId = req.user._id;
    const { threshold = 10 } = req.query; // العتبة الافتراضية 10

    // المنتجات منخفضة المخزون
    const lowStockProducts = await Product.find({
      adminId,
      quantity: { $lte: parseInt(threshold) },
      quantity: { $gt: 0 } // استبعاد المنتجات النافدة تماماً
    }).select('name sku category quantity originalPrice sellingPrice createdAt updatedAt');

    // المنتجات النافدة تماماً
    const outOfStockProducts = await Product.find({
      adminId,
      quantity: 0
    }).select('name sku category originalPrice sellingPrice createdAt updatedAt');

    // إحصائيات سريعة
    const stats = {
      lowStockCount: lowStockProducts.length,
      outOfStockCount: outOfStockProducts.length,
      totalAffectedProducts: lowStockProducts.length + outOfStockProducts.length,
      threshold: parseInt(threshold)
    };

    // تجميع حسب الفئة
    const lowStockByCategory = lowStockProducts.reduce((acc, product) => {
      const category = product.category || 'غير محدد';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(product);
      return acc;
    }, {});

    const outOfStockByCategory = outOfStockProducts.reduce((acc, product) => {
      const category = product.category || 'غير محدد';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(product);
      return acc;
    }, {});

    // تنبيهات مقترحة
    const alerts = [];
    
    if (outOfStockProducts.length > 0) {
      alerts.push({
        type: 'critical',
        message: `يوجد ${outOfStockProducts.length} منتج نافد من المخزون`,
        action: 'يجب إعادة تعبئة المخزون فوراً'
      });
    }

    if (lowStockProducts.length > 0) {
      alerts.push({
        type: 'warning',
        message: `يوجد ${lowStockProducts.length} منتج منخفض المخزون`,
        action: 'يُنصح بإعادة تعبئة المخزون قريباً'
      });
    }

    if (lowStockProducts.length === 0 && outOfStockProducts.length === 0) {
      alerts.push({
        type: 'success',
        message: 'جميع المنتجات متوفرة بكميات جيدة',
        action: 'لا توجد إجراءات مطلوبة حالياً'
      });
    }

    res.json({
      stats,
      alerts,
      lowStockProducts: {
        total: lowStockProducts.length,
        products: lowStockProducts,
        byCategory: lowStockByCategory
      },
      outOfStockProducts: {
        total: outOfStockProducts.length,
        products: outOfStockProducts,
        byCategory: outOfStockByCategory
      },
      generatedAt: new Date().toISOString()
    });
  } catch (err) {
    console.error('Error in lowStockController:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
