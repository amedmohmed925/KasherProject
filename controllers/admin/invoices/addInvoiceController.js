const Invoice = require('../../../models/Invoice');
const Product = require('../../../models/Product');

const addInvoiceController = async (req, res) => {
  try {
    const { products, customerName } = req.body;

    // التحقق من المنتجات باستخدام SKU
    const productDetails = await Promise.all(products.map(async (item) => {
      const product = await Product.findOne({ sku: item.sku });
      if (!product) {
        throw new Error(`Product with SKU ${item.sku} not found`);
      }
      if (item.quantity > product.stock) {
        throw new Error(`Requested quantity for SKU ${item.sku} exceeds available stock`);
      }
      return {
        productId: product._id,
        name: product.name,
        sku: product.sku,
        quantity: item.quantity,
        price: product.sellingPrice,
        total: product.sellingPrice * item.quantity
      };
    }));

    // حساب المجموع الإجمالي
    const totalAmount = productDetails.reduce((sum, item) => sum + item.total, 0);

    // إنشاء رقم فاتورة فريد
    const invoiceNumber = `INV-${Date.now()}`;

    // إنشاء الفاتورة
    const invoice = new Invoice({
      tenantId: req.user.tenantId,
      invoiceNumber,
      customer: {
        name: customerName
      },
      items: productDetails,
      totalAmount,
      createdAt: new Date()
    });
    await invoice.save();

    res.status(201).json({ message: 'Invoice created successfully', invoice });
  } catch (error) {
    console.error('Error in addInvoiceController:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = addInvoiceController;
