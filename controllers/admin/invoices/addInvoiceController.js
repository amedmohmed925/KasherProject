const Invoice = require('../../../models/Invoice');
const Product = require('../../../models/Product');

const addInvoiceController = async (req, res) => {
  try {
    const { products, customerName, totalPrice } = req.body;

    // التحقق من المنتجات
    const productDetails = await Promise.all(products.map(async (item) => {
      const product = await Product.findById(item.productId);
      if (!product) {
        throw new Error(`Product with ID ${item.productId} not found`);
      }
      return {
        productId: product._id,
        name: product.name,
        quantity: item.quantity,
        price: product.sellingPrice * item.quantity
      };
    }));

    // إنشاء الفاتورة
    const invoice = new Invoice({
      products: productDetails,
      customerName,
      totalPrice,
      date: new Date()
    });

    await invoice.save();

    res.status(201).json({ message: 'Invoice created successfully', invoice });
  } catch (error) {
    console.error('Error in addInvoiceController:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = addInvoiceController;
