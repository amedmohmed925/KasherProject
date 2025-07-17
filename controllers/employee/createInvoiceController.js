const Product = require('../../models/Product');
const Invoice = require('../../models/Invoice');
const mongoose = require('mongoose');

module.exports = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { tenantId, customer, items } = req.body;
    if (req.user.role !== 'employee' || req.user.tenantId.toString() !== tenantId) {
      await session.abortTransaction();
      return res.status(403).json({ message: 'Unauthorized' });
    }
    let totalAmount = 0;
    const invoiceItems = [];
    for (const item of items) {
      const product = await Product.findOne({ sku: item.sku, tenantId }).session(session);
      if (!product) {
        await session.abortTransaction();
        return res.status(404).json({ message: `Product with SKU ${item.sku} not found` });
      }
      if (product.quantity < item.quantity) {
        await session.abortTransaction();
        return res.status(400).json({ message: `Insufficient stock for SKU ${item.sku}` });
      }
      product.quantity -= item.quantity;
      await product.save({ session });
      const total = item.quantity * product.sellingPrice;
      totalAmount += total;
      invoiceItems.push({
        productId: product._id,
        sku: product.sku,
        name: product.name,
        quantity: item.quantity,
        price: product.sellingPrice,
        total
      });
    }
    const invoiceCount = await Invoice.countDocuments({ tenantId });
    const invoiceNumber = `INV-${invoiceCount + 1}`;
    const invoice = new Invoice({
      tenantId,
      invoiceNumber,
      employeeId: req.user._id,
      customer,
      items: invoiceItems,
      totalAmount
    });
    await invoice.save({ session });
    await session.commitTransaction();
    res.status(201).json(invoice);
  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({ message: 'Server error' });
  } finally {
    session.endSession();
  }
};
