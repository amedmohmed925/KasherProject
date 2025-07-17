# Supermarket Multi-Tenant Cashier System

نظام كاشير متعدد الشركات (Multi-Tenant) لإدارة السوبرماركت، مع صلاحيات منفصلة للأدمن، الموظف، والسوبر أدمن.

---

## الأدوار والصلاحيات

### 1. السوبر أدمن (Super Admin)
- إدارة جميع الشركات (tenants): إضافة/تعطيل/حذف شركة.
- إضافة/تعديل/حذف أدمن لأي شركة.
- عرض إحصائيات وأرباح كل الشركات.
- تقارير إجمالية لكل النظام.

### 2. الأدمن (Admin)
- صاحب الشركة (السوبرماركت).
- إدارة المنتجات والتصنيفات والموظفين.
- إضافة موظفين عبر الدعوات.
- عرض الفواتير والتقارير الخاصة بشركته فقط.
- رؤية إحصائيات شركته.

### 3. الموظف (Employee)
- تسجيل الدخول وتنفيذ عمليات البيع (إصدار فواتير).
- رؤية المنتجات والفواتير الخاصة بشركته فقط.

---

## ملخص الـ Endpoints الرئيسية

### Auth (تسجيل/دخول/دعوات)
- `POST   /api/register`           : تسجيل أدمن جديد وإنشاء شركة
- `POST   /api/login`              : تسجيل الدخول (جميع الأدوار)
- `POST   /api/verify-otp`         : تفعيل البريد للأدمن
- `POST   /api/forgot-password`    : إرسال كود إعادة تعيين كلمة المرور
- `POST   /api/reset-password`     : إعادة تعيين كلمة المرور
- `POST   /api/invite-employee`    : دعوة موظف (الأدمن فقط)
- `GET    /api/invite-info`        : جلب بيانات الدعوة
- `POST   /api/accept-invite`      : إكمال تسجيل الموظف عبر الدعوة

### Employee
- `GET    /api/employee/products`  : عرض المنتجات
- `POST   /api/employee/invoices`  : إنشاء فاتورة بيع
- `GET    /api/employee/invoices`  : عرض فواتير الموظف

### Admin
- `POST   /api/admin/products`     : إضافة منتج
- `PUT    /api/admin/products/:id` : تعديل منتج
- `GET    /api/admin/invoices`     : عرض فواتير الشركة
- `GET    /api/admin/report`       : تقرير مبيعات الشركة
- `GET    /api/admin/stats`        : إحصائيات الشركة
- إدارة الموظفين: إضافة/تعديل/حذف موظف

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

---

## ملاحظات هامة
- كل endpoint يتطلب صلاحية الدور المناسب (توكن JWT في الهيدر).
- الأدمن يرى ويدير بيانات شركته فقط.
- الموظف لا يمكنه إدارة المنتجات أو الموظفين، فقط البيع وعرض الفواتير.
- السوبر أدمن يتحكم في كل النظام ولا يمكن لأي مستخدم آخر الوصول لمساراته.
- جميع الردود في حال الخطأ ترجع رسالة واضحة (`message`).

---

## لمزيد من التفاصيل
- راجع ملفات README داخل كل مجلد (auth, admin, employee, superAdmin) لتفاصيل كل endpoint، البودي، والردود المتوقعة.
why?