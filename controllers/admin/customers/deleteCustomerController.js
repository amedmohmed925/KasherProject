const Customer = require('../../../models/Customer');
const Invoice = require('../../../models/Invoice');

/**
 * Delete customer
 * @route DELETE /api/admin/customers/:id
 * @access Private (Admin)
 */
module.exports = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;

    // Find customer
    const customer = await Customer.findOne({ _id: id, adminId });
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'العميل غير موجود'
      });
    }

    // Check if customer has invoices
    const invoiceCount = await Invoice.countDocuments({ customerId: id });
    if (invoiceCount > 0) {
      return res.status(400).json({
        success: false,
        message: `لا يمكن حذف العميل لأن لديه ${invoiceCount} فاتورة مرتبطة به`
      });
    }

    // Delete customer
    await Customer.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'تم حذف العميل بنجاح'
    });

  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
};
