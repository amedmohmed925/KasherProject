const Customer = require('../../../models/Customer');
const { validationResult } = require('express-validator');

/**
 * Add new customer
 * @route POST /api/admin/customers
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

    const { name, phone, email, address, notes } = req.body;
    const adminId = req.user.id;

    // Check if customer already exists for this admin
    const existingCustomer = await Customer.findOne({
      adminId,
      $or: [
        { name, phone },
        { email: email || null }
      ]
    });

    if (existingCustomer) {
      return res.status(400).json({
        success: false,
        message: 'العميل موجود بالفعل'
      });
    }

    // Create new customer
    const customer = new Customer({
      adminId,
      name,
      phone,
      email,
      address,
      notes
    });

    await customer.save();

    res.status(201).json({
      success: true,
      message: 'تم إضافة العميل بنجاح',
      data: customer
    });

  } catch (error) {
    console.error('Error adding customer:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
};
