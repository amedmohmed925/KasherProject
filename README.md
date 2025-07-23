# Supermarket Multi-Tenant Cashier System

نظام كاشير متعدد الشركات (Multi-Tenant) لإدارة السوبرماركت، مع صلاحيات منفصلة للأدمن، والسوبر أدمن.

---

## الأدوار والصلاحيات

### 1. السوبر أدمن (Super Admin)
- إدارة جميع الشركات (tenants): إضافة/تعطيل/حذف شركة.
- إضافة/تعديل/حذف أدمن لأي شركة.
- عرض إحصائيات وأرباح كل الشركات.
- تقارير إجمالية لكل النظام.
- إدارة الاشتراكات: قبول/رفض الاشتراكات مع إرسال رسائل بريدية.

### 2. الأدمن (Admin)
- صاحب الشركة (السوبرماركت).
- إدارة المنتجات والتصنيفات.
- عرض الفواتير والتقارير الخاصة بشركته فقط.
- رؤية إحصائيات شركته.

---

## ملخص الـ Endpoints الرئيسية

### Auth (تسجيل/دخول/دعوات)
- `POST   /api/register`           : تسجيل أدمن جديد وإنشاء شركة
- `POST   /api/login`              : تسجيل الدخول (جميع الأدوار)
- `POST   /api/verify-otp`         : تفعيل البريد للأدمن
- `POST   /api/forgot-password`    : إرسال كود إعادة تعيين كلمة المرور
- `POST   /api/reset-password`     : إعادة تعيين كلمة المرور

### Admin
- `POST   /api/admin/products`     : إضافة منتج
- `PUT    /api/admin/products/:id` : تعديل منتج
- `GET    /api/admin/invoices`     : عرض فواتير الشركة
- `GET    /api/admin/report`       : تقرير مبيعات الشركة
- `GET    /api/admin/stats`        : إحصائيات الشركة

### Super Admin
- `GET    /api/super-admin/tenants`           : عرض كل الشركات
- `GET    /api/super-admin/tenants/:tenantId` : تفاصيل شركة (منتجات، فواتير...)
- `POST   /api/super-admin/users/admin`       : إضافة أدمن لشركة
- `PUT    /api/super-admin/users/admin/:id`   : تعديل أدمن
- `DELETE /api/super-admin/users/admin/:id`   : حذف أدمن
- `PATCH  /api/super-admin/tenants/:tenantId/disable` : تعطيل شركة
- `DELETE /api/super-admin/tenants/:tenantId` : حذف شركة وكل بياناتها
- `GET    /api/super-admin/stats`             : إحصائيات عامة
- `GET    /api/super-admin/reports/global`    : تقرير إجمالي لكل النظام
- `POST   /api/super-admin/subscriptions/approve` : قبول/رفض الاشتراكات

---

## المزايا التقنية

### 1. التقنيات المستخدمة
- **Node.js**: بيئة التشغيل.
- **Express.js**: إطار العمل الأساسي.
- **MongoDB**: قاعدة البيانات.
- **Mongoose**: ORM لإدارة البيانات.
- **JWT**: لإدارة التوكنات.
- **Bcrypt**: لتشفير كلمات المرور.
- **Nodemailer**: لإرسال الرسائل البريدية.

### 2. إدارة الأخطاء
- جميع الردود في حال الخطأ ترجع رسالة واضحة (`message`).
- يتم التحقق من الصلاحيات لكل Endpoint.

### 3. الأمان
- يتم استخدام JWT للتحقق من هوية المستخدم.
- يتم تشفير كلمات المرور باستخدام Bcrypt.
- تم إضافة حماية ضد هجمات XSS باستخدام مكتبة `xss-clean`.
- تم إضافة حماية ضد هجمات DDoS باستخدام `express-rate-limit` مع استثناء بعض المسارات.

---

## ملاحظات هامة
- كل Endpoint يتطلب صلاحية الدور المناسب (توكن JWT في الهيدر).
- الأدمن يرى ويدير بيانات شركته فقط.
- السوبر أدمن يتحكم في كل النظام ولا يمكن لأي مستخدم آخر الوصول لمساراته.

---

## لمزيد من التفاصيل
- راجع ملفات README داخل كل مجلد (auth, admin, superAdmin) لتفاصيل كل Endpoint، البودي، والردود المتوقعة.