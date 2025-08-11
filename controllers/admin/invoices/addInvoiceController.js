const Invoice = require('../../../models/Invoice');
const Product = require('../../../models/Product');
const Customer = require('../../../models/Customer');
const { validationResult } = require('express-validator');

const addInvoiceController = async (req, res) => {
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

    const { 
      items, 
      customer, 
      customerId, 
      discount = { type: 'fixed', value: 0 },
      paymentMethod = 'cash',
      notes 
    } = req.body;
    const adminId = req.user.id;

    // التحقق من المنتجات باستخدام ID
    const productDetails = await Promise.all(items.map(async (item) => {
      const product = await Product.findOne({ 
        _id: item.productId, 
        adminId: adminId 
      });
      
      if (!product) {
        throw new Error(`المنتج غير موجود: ${item.productId}`);
      }
      
      if (item.quantity > product.quantity) {
        throw new Error(`الكمية المطلوبة للمنتج ${product.name} تتجاوز المخزون المتاح`);
      }
      
      return {
        productId: product._id,
        name: product.name,
        sku: product.sku,
        quantity: item.quantity,
        price: product.sellingPrice,
        originalPrice: product.originalPrice,
        total: product.sellingPrice * item.quantity
      };
    }));

    // حساب المجموع قبل الخصم
    const subtotal = productDetails.reduce((sum, item) => sum + item.total, 0);

    // حساب الخصم
    let discountAmount = 0;
    if (discount.value > 0) {
      if (discount.type === 'percentage') {
        discountAmount = (subtotal * discount.value) / 100;
      } else {
        discountAmount = discount.value;
      }
    }

    // المجموع النهائي بعد الخصم
    const totalAmount = subtotal - discountAmount;

    // حساب الربح الإجمالي
    const totalProfit = productDetails.reduce((sum, item) => {
      const itemProfit = (item.price - item.originalPrice) * item.quantity;
      return sum + itemProfit;
    }, 0);

    // إنشاء رقم فاتورة فريد
    const invoiceNumber = `INV-${Date.now()}`;

    // إنشاء الفاتورة
    const invoice = new Invoice({
      adminId,
      invoiceNumber,
      customerId: customerId || null,
      customer: {
        name: customer.name,
        phone: customer.phone || ''
      },
      items: productDetails,
      subtotal,
      discount: {
        type: discount.type,
        value: discount.value,
        amount: discountAmount
      },
      totalAmount,
      profit: totalProfit,
      paymentMethod,
      notes,
      createdAt: new Date()
    });

    await invoice.save();

    // تحديث كمية المنتجات في المخزون
    await Promise.all(productDetails.map(async (item) => {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { quantity: -item.quantity } }
      );
    }));

    // تحديث إحصائيات العميل إذا كان مربوط بعميل
    if (customerId) {
      await Customer.findByIdAndUpdate(customerId, {
        $inc: { 
          totalOrders: 1, 
          totalSpent: totalAmount 
        },
        lastOrderDate: new Date()
      });
    }

    res.status(201).json({ 
      success: true,
      message: 'تم إنشاء الفاتورة بنجاح', 
      data: invoice 
    });

  } catch (error) {
    console.error('Error in addInvoiceController:', error);
    res.status(500).json({ 
      success: false,
      message: 'خطأ في الخادم', 
      error: error.message 
    });
  }
};

module.exports = addInvoiceController;
