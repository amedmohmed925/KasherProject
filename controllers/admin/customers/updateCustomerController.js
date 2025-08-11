const Customer = require('../../../models/Customer');
const { validationResult } = require('express-validator');

/**
 * Update customer
 * @route PUT /api/admin/customers/:id
 * @access Private (Admin)
 */
module.exports = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'خطأ في البيانات المدخلة',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { name, phone, email, address, notes, status } = req.body;
    const adminId = req.user.id;

    // Find customer
    const customer = await Customer.findOne({ _id: id, adminId });
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'العميل غير موجود'
      });
    }

    // Check for duplicate if name/phone/email changed
    if (name !== customer.name || phone !== customer.phone || email !== customer.email) {
      const existingCustomer = await Customer.findOne({
        _id: { $ne: id },
        adminId,
        $or: [
          { name, phone },
          { email: email || null }
        ]
      });

      if (existingCustomer) {
        return res.status(400).json({
          success: false,
          message: 'عميل آخر بنفس البيانات موجود بالفعل'
        });
      }
    }

    // Update customer
    const updatedCustomer = await Customer.findByIdAndUpdate(
      id,
      {
        name,
        phone,
        email,
        address,
        notes,
        status,
        updatedAt: Date.now()
      },
      { new: true }
    );

    res.json({
      success: true,
      message: 'تم تحديث بيانات العميل بنجاح',
      data: updatedCustomer
    });

  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
};
