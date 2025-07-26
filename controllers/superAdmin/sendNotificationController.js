const User = require('../../models/User');
const mailSender = require('../../utils/mailSender');

module.exports = async (req, res) => {
  try {
    if (req.user.role !== 'superAdmin') {
      return res.status(403).json({ message: 'غير مسموح' });
    }

    const { recipients, subject, message, type = 'email' } = req.body;

    // التحقق من وجود البيانات المطلوبة
    if (!recipients || !subject || !message) {
      return res.status(400).json({ 
        message: 'المستقبلين والموضوع والرسالة مطلوبين' 
      });
    }

    let targetUsers = [];

    // تحديد المستقبلين
    if (recipients.type === 'all') {
      // جميع المستخدمين
      targetUsers = await User.find({ role: 'admin' });
    } else if (recipients.type === 'specific') {
      // مستخدمين محددين بالـ ID
      targetUsers = await User.find({ 
        _id: { $in: recipients.userIds }, 
        role: 'admin' 
      });
    } else if (recipients.type === 'verified') {
      // المستخدمين المفعلين فقط
      targetUsers = await User.find({ 
        role: 'admin', 
        isVerified: true 
      });
    } else if (recipients.type === 'unverified') {
      // المستخدمين غير المفعلين
      targetUsers = await User.find({ 
        role: 'admin', 
        isVerified: false 
      });
    }

    if (targetUsers.length === 0) {
      return res.status(400).json({ 
        message: 'لم يتم العثور على مستخدمين للإرسال إليهم' 
      });
    }

    // إرسال الإشعارات
    const results = {
      sent: 0,
      failed: 0,
      errors: []
    };

    for (const user of targetUsers) {
      try {
        if (type === 'email') {
          // إرسال بريد إلكتروني
          const emailContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333;">مرحباً ${user.firstName} ${user.lastName}</h2>
              <h3 style="color: #007bff;">${subject}</h3>
              <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                ${message.replace(/\n/g, '<br>')}
              </div>
              <hr style="margin: 30px 0;">
              <p style="color: #666; font-size: 12px;">
                هذه رسالة من إدارة نظام كاشير<br>
                تاريخ الإرسال: ${new Date().toLocaleString('ar-EG')}
              </p>
            </div>
          `;

          await mailSender(user.email, subject, emailContent);
          results.sent++;
        }
      } catch (error) {
        results.failed++;
        results.errors.push({
          userId: user._id,
          email: user.email,
          error: error.message
        });
      }
    }

    // حفظ سجل الإشعار
    const notificationLog = {
      sentBy: req.user._id,
      sentAt: new Date(),
      subject,
      message,
      recipients: {
        type: recipients.type,
        count: targetUsers.length,
        userIds: recipients.userIds || []
      },
      results
    };

    // يمكن حفظ هذا في قاعدة البيانات إذا كنت تريد سجل للإشعارات
    
    res.json({
      success: true,
      message: 'تم إرسال الإشعارات',
      summary: {
        totalTargeted: targetUsers.length,
        sent: results.sent,
        failed: results.failed
      },
      details: results
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
