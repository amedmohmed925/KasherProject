const Subscription = require('../../models/Subscription');
const cloudinary = require('../../utils/cloudinary');
const path = require('path');

module.exports = async (req, res) => {
  try {
    let { plan, paidAmountText, duration, customNotes, price, startDate, endDate } = req.body;
    const file = req.file;
    
    // Set default prices based on plan
    if (plan === 'trial') {
      price = 0;
      duration = 'trial';
      // Calculate 30-day trial period
      const start = new Date(startDate);
      const end = new Date(start.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days
      endDate = end.toISOString();
    } else if (plan === 'monthly') {
      price = 49;
      duration = 'month';
    } else if (plan === 'yearly') {
      price = 499;
      duration = 'year';
    }
    
    // Validate receipt image requirement
    if (!file && plan !== 'custom' && plan !== 'trial') {
      return res.status(400).json({ message: 'Receipt image is required for paid plans.' });
    }
    
    let receiptImage = '';
    let receiptFileName = '';
    if (file && plan !== 'trial') {
      // Convert buffer to base64 for Cloudinary upload (memory storage compatibility)
      const base64Image = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
      
      const uploadResult = await cloudinary.uploader.upload(base64Image, {
        folder: 'receipts',
        resource_type: 'image',
      });
      receiptImage = uploadResult.secure_url;
      receiptFileName = path.basename(uploadResult.public_id);
    }
    
    const subscription = new Subscription({
      adminId: req.user._id,
      plan,
      price,
      startDate,
      endDate,
      status: plan === 'trial' ? 'approved' : 'pending', // Auto-approve trial
      paymentConfirmed: plan === 'trial' ? true : false,
      receiptImage,
      paidAmountText,
      duration,
      customNotes,
      receiptFileName,
    });
    
    await subscription.save();
    res.status(201).json({ 
      message: plan === 'trial' ? 'Trial subscription activated successfully' : 'Subscription request submitted successfully', 
      subscription 
    });
  } catch (error) {
    console.error('Error uploading receipt:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
