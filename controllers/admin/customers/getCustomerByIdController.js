const Customer = require('../../../models/Customer');
const Invoice = require('../../../models/Invoice');

/**
 * Get customer by ID with order history
 * @route GET /api/admin/customers/:id
 * @access Private (Admin)
 */
module.exports = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    // Find customer
    const customer = await Customer.findOne({ _id: id, adminId });
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'العميل غير موجود'
      });
    }

    // Get customer's invoices with pagination
    const skip = (page - 1) * limit;
    const totalInvoices = await Invoice.countDocuments({ customerId: id });
    
    const invoices = await Invoice.find({ customerId: id })
      .populate('items.productId', 'name sku')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    // Calculate customer statistics
    const stats = await Invoice.aggregate([
      { $match: { customerId: customer._id } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$totalAmount' },
          averageOrder: { $avg: '$totalAmount' },
          lastOrder: { $max: '$createdAt' }
        }
      }
    ]);

    const customerStats = stats[0] || {
      totalOrders: 0,
      totalSpent: 0,
      averageOrder: 0,
      lastOrder: null
    };

    res.json({
      success: true,
      data: {
        customer: {
          ...customer.toObject(),
          stats: customerStats
        },
        invoices: {
          data: invoices,
          pagination: {
            current: parseInt(page),
            pages: Math.ceil(totalInvoices / limit),
            total: totalInvoices,
            limit: parseInt(limit)
          }
        }
      }
    });

  } catch (error) {
    console.error('Error getting customer:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
};
