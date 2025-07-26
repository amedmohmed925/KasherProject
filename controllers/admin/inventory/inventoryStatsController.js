const Product = require('../../../models/Product');

module.exports = async (req, res) => {
  try {
    const adminId = req.user._id;

    // إجمالي عدد المنتجات
    const totalProducts = await Product.countDocuments({ adminId });

    // إجمالي قيمة المخزون
    const inventoryValue = await Product.aggregate([
      { $match: { adminId } },
      {
        $group: {
          _id: null,
          totalQuantity: { $sum: '$quantity' },
          totalOriginalValue: { $sum: { $multiply: ['$quantity', '$originalPrice'] } },
          totalSellingValue: { $sum: { $multiply: ['$quantity', '$sellingPrice'] } },
          expectedProfit: { 
            $sum: { 
              $multiply: [
                '$quantity', 
                { $subtract: ['$sellingPrice', '$originalPrice'] }
              ] 
            } 
          }
        }
      }
    ]);

    // المنتجات منخفضة المخزون (أقل من 10)
    const lowStockProducts = await Product.countDocuments({ 
      adminId, 
      quantity: { $lt: 10 } 
    });

    // المنتجات النافدة
    const outOfStockProducts = await Product.countDocuments({ 
      adminId, 
      quantity: 0 
    });

    // أكثر المنتجات ربحية (أعلى 5)
    const topProfitableProducts = await Product.find({ adminId })
      .sort({ 
        profit: -1  // ترتيب حسب الربح تنازليا
      })
      .limit(5)
      .select('name sku sellingPrice originalPrice quantity');

    // المنتجات حسب الفئات
    const productsByCategory = await Product.aggregate([
      { $match: { adminId } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' },
          totalValue: { $sum: { $multiply: ['$quantity', '$sellingPrice'] } }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const stats = {
      overview: {
        totalProducts,
        totalQuantity: inventoryValue[0]?.totalQuantity || 0,
        totalOriginalValue: inventoryValue[0]?.totalOriginalValue || 0,
        totalSellingValue: inventoryValue[0]?.totalSellingValue || 0,
        expectedProfit: inventoryValue[0]?.expectedProfit || 0,
        lowStockProducts,
        outOfStockProducts
      },
      topProfitableProducts,
      productsByCategory: productsByCategory.map(cat => ({
        category: cat._id || 'غير محدد',
        count: cat.count,
        totalQuantity: cat.totalQuantity,
        totalValue: cat.totalValue
      }))
    };

    res.json(stats);
  } catch (err) {
    console.error('Error in inventoryStatsController:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
