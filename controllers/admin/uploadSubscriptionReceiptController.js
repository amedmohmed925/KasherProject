const Subscription = require('../../models/Subscription');
const cloudinary = require('../../utils/cloudinary');
const path = require('path');

module.exports = async (req, res) => {
  try {
    const { plan, paidAmountText, duration, customNotes, price, startDate, endDate } = req.body;
    const file = req.file;
    if (!file && plan !== 'custom') {
      return res.status(400).json({ message: 'Receipt image is required unless plan is custom.' });
    }
    let receiptImage = '';
    let receiptFileName = '';
    if (file && plan !== 'custom') {
      const uploadResult = await cloudinary.uploader.upload(file.path, {
        folder: 'receipts',
        resource_type: 'image',
      });
      receiptImage = uploadResult.secure_url;
      receiptFileName = path.basename(uploadResult.public_id);
    }
    const subscription = new Subscription({
      tenantId: req.user.tenantId,
      plan,
      price,
      startDate,
      endDate,
      status: 'pending',
      paymentConfirmed: false,
      receiptImage,
      paidAmountText,
      duration,
      customNotes,
      receiptFileName,
    });
    await subscription.save();
    res.status(201).json({ message: 'Subscription request submitted successfully', subscription });
  } catch (error) {
    console.error('Error uploading receipt:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
