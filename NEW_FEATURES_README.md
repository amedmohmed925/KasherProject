# Kasher Project - New Features Implementation

## التحديثات الجديدة ا### 5. التحليلات المحسنة والفترات الزمنية
تم إضافة نظام تحليلات شامل يدعم فترات زمنية مختلفة:

#### نقاط النهاية الجديدة للتحليلات:

1. **`GET /api/admin/analytics/periods`** - تحليلات حسب الفترة الزمنية
   - المعاملات:
     - `period`: today, week, month, year, custom
     - `startDate`: للفترة المخصصة
     - `endDate`: للفترة المخصصة
   - المخرجات:
     - إجمالي الإيرادات والطلبات
     - الربح والمصروفات
     - أفضل المنتجات مبيعاً
     - إحصائيات العملاء
     - الاتجاه الزمني للمبيعات
     - توزيع طرق الدفع

2. **`GET /api/admin/analytics/compare`** - مقارنة بين الفترات
   - المعاملات:
     - `currentPeriod`: الفترة الحالية
     - `comparePeriod`: فترة المقارنة
   - المخرجات:
     - إحصائيات الفترة الحالية
     - إحصائيات فترة المقارنة
     - نسب التغيير والنمو

3. **`GET /api/admin/analytics/summary`** - خلاصة الداشبورد
   - المخرجات:
     - إحصائيات سريعة لجميع الفترات
     - معدلات النمو
     - آخر الفواتير
     - أفضل المنتجات
     - تنبيهات المخزون

4. **`GET /api/admin/analytics/enhanced`** - التحليلات الشاملة
   - **إجمالي المصروفات (محسوبة تلقائياً من أسعار شراء المنتجات المباعة)**
   - صافي الربح وهامش الربح
   - معدل الخصومات
   - تحليلات متقدمة

**ملاحظة هامة**: إجمالي المصروفات يتم حسابه تلقائياً من أسعار الشراء (`originalPrice`) للمنتجات المباعة، وليس من إدخالات المصروفات اليدوية.. إدارة العملاء الشاملة (Customer Management)
تم إضافة نظام شامل لإدارة العملاء مع الميزات التالية:

#### الموديل الجديد: Customer.js
```javascript
{
  adminId: ObjectId, // مربوط بالأدمن
  name: String, // اسم العميل (مطلوب)
  phone: String, // رقم الهاتف
  email: String, // البريد الإلكتروني
  address: String, // العنوان
  notes: String, // ملاحظات
  totalOrders: Number, // إجمالي الطلبات
  totalSpent: Number, // إجمالي المبلغ المنفق
  lastOrderDate: Date, // تاريخ آخر طلب
  status: String // active, inactive
}
```

#### نقاط النهاية الجديدة للعملاء:
- `POST /api/admin/customers` - إضافة عميل جديد
- `GET /api/admin/customers` - جلب جميع العملاء مع البحث والفلترة
- `GET /api/admin/customers/stats` - إحصائيات العملاء
- `GET /api/admin/customers/:id` - تفاصيل عميل محدد مع تاريخ الطلبات
- `PUT /api/admin/customers/:id` - تحديث بيانات العميل
- `DELETE /api/admin/customers/:id` - حذف العميل

### 2. نظام الخصومات في الفواتير (Invoice Discounts)
تم تطوير نظام الفواتير ليدعم الخصومات بالشكل التالي:

#### التحديث في Invoice.js:
```javascript
{
  customerId: ObjectId, // ربط اختياري بالعميل
  subtotal: Number, // المجموع قبل الخصم
  discount: {
    type: String, // percentage أو fixed
    value: Number, // قيمة الخصم
    amount: Number // مبلغ الخصم الفعلي
  },
  totalAmount: Number, // المجموع النهائي بعد الخصم
  profit: Number, // الربح الإجمالي
  paymentMethod: String, // طريقة الدفع
  notes: String // ملاحظات
}
```

### 3. إزالة صور المنتجات
تم إزالة حقل `image` من موديل المنتجات كما طُلب.

### 4. نظام إدارة المصروفات (Expense Management)

#### الموديل الجديد: Expense.js
```javascript
{
  adminId: ObjectId,
  title: String, // عنوان المصروف
  amount: Number, // المبلغ
  category: String, // الفئة
  description: String, // الوصف
  date: Date, // تاريخ المصروف
}
```

#### نقاط النهاية للمصروفات:
- `POST /api/admin/expenses` - إضافة مصروف جديد
- `GET /api/admin/expenses` - جلب المصروفات مع الفلترة

### 5. التحليلات المحسنة (Enhanced Analytics)
تم إضافة نقطة نهاية جديدة للتحليلات المتقدمة:

#### `GET /api/admin/analytics/enhanced`
تشمل المقاييس التالية:
- إجمالي الإيرادات والطلبات
- إجمالي المصروفات
- صافي الربح
- متوسط قيمة الطلب
- إجمالي الخصومات المطبقة
- عدد العملاء النشطين
- أفضل المنتجات مبيعاً
- الاتجاه اليومي للمبيعات والمصروفات
- توزيع طرق الدفع
- تنبيهات المخزون المنخفض

## كيفية الاستخدام

### 1. إنشاء عميل جديد
```json
POST /api/admin/customers
{
  "name": "أحمد محمد",
  "phone": "01234567890",
  "email": "ahmed@example.com",
  "address": "القاهرة، مصر",
  "notes": "عميل VIP"
}
```

### 2. إنشاء فاتورة بخصم وربط عميل
```json
POST /api/admin/invoices
{
  "customerId": "customer_id_here", // اختياري
  "customer": {
    "name": "أحمد محمد",
    "phone": "01234567890"
  },
  "items": [
    {
      "productId": "product_id_here",
      "quantity": 2
    }
  ],
  "discount": {
    "type": "percentage",
    "value": 10
  },
  "paymentMethod": "cash",
  "notes": "خصم للعميل المميز"
}
```

### 3. إضافة مصروف
```json
POST /api/admin/expenses
{
  "title": "فاتورة كهرباء",
  "amount": 500,
  "category": "utilities",
  "description": "فاتورة الكهرباء لشهر ديسمبر"
}
```

### 4. الحصول على التحليلات حسب الفترة
```
GET /api/admin/analytics/periods?period=today
GET /api/admin/analytics/periods?period=week
GET /api/admin/analytics/periods?period=month
GET /api/admin/analytics/periods?period=year
GET /api/admin/analytics/periods?period=custom&startDate=2024-01-01&endDate=2024-01-31
```

### 5. مقارنة الأداء بين الفترات
```
GET /api/admin/analytics/compare?currentPeriod=month&comparePeriod=month
GET /api/admin/analytics/compare?currentPeriod=week&comparePeriod=week
```

### 6. الحصول على خلاصة الداشبورد
```
GET /api/admin/analytics/summary
```

### 7. الحصول على التحليلات المحسنة
```
GET /api/admin/analytics/enhanced?period=30
```

## الملفات المضافة/المحدثة

### الموديلات الجديدة:
- `models/Customer.js` - موديل العملاء
- `models/Expense.js` - موديل المصروفات

### الموديلات المحدثة:
- `models/Invoice.js` - إضافة الخصومات وربط العملاء
- `models/Product.js` - إزالة حقل الصورة

### الكنترولرز الجديدة:
- `controllers/admin/customers/` - إدارة العملاء
- `controllers/admin/expenses/` - إدارة المصروفات
- `controllers/admin/dashboard/enhancedAnalyticsController.js` - التحليلات المحسنة
- `controllers/admin/analytics/getAnalyticsByPeriodController.js` - تحليلات الفترات الزمنية
- `controllers/admin/analytics/compareAnalyticsController.js` - مقارنة الفترات
- `controllers/admin/analytics/getDashboardSummaryController.js` - خلاصة الداشبورد

### الكنترولرز المحدثة:
- `controllers/admin/invoices/addInvoiceController.js` - دعم الخصومات والعملاء

### الراوتس الجديدة:
- `routes/customers.js` - راوتس العملاء
- `routes/expenses.js` - راوتس المصروفات

### الملفات المحدثة:
- `server.js` - إضافة الراوتس الجديدة
- `routes/admin.js` - إضافة راوت التحليلات المحسنة

## الميزات الرئيسية

### 1. نظام العملاء
- ✅ إضافة عملاء جدد مع بيانات شاملة
- ✅ البحث والفلترة بالاسم والهاتف والبريد الإلكتروني
- ✅ تتبع إحصائيات العميل (الطلبات، المبلغ المنفق)
- ✅ تاريخ الطلبات للعميل
- ✅ إحصائيات شاملة للعملاء

### 2. نظام الخصومات
- ✅ خصم بالنسبة المئوية أو مبلغ ثابت
- ✅ حساب تلقائي للمبلغ النهائي
- ✅ تتبع إجمالي الخصومات في التحليلات

### 3. إدارة المصروفات
- ✅ تصنيف المصروفات بفئات مختلفة
- ✅ تتبع المصروفات بالتاريخ
- ✅ احتساب صافي الربح

### 4. التحليلات المتقدمة
- ✅ مقاييس مالية شاملة
- ✅ تحليل الاتجاهات اليومية
- ✅ أداء المنتجات
- ✅ إحصائيات العملاء
- ✅ تنبيهات المخزون

## ملاحظات مهمة

1. **التوافق العكسي**: جميع التحديثات متوافقة مع الكود الموجود
2. **الحماية**: جميع نقاط النهاية محمية بالمصادقة وفحص الاشتراك
3. **التحقق**: تم إضافة تحقق شامل للبيانات المدخلة
4. **الفهرسة**: تم إضافة فهارس للبحث السريع
5. **الأداء**: استخدام aggregation pipelines للتحليلات السريعة

## الخطوات التالية

لاستكمال التطبيق، يُنصح بـ:
1. اختبار جميع نقاط النهاية الجديدة
2. إضافة واجهة المستخدم للميزات الجديدة
3. تحديث التوثيق بـ Swagger
4. إضافة المزيد من الاختبارات

## دعم فني

لأي استفسارات أو مشاكل، يرجى التأكد من:
- تشغيل MongoDB بشكل صحيح
- تحديث متغيرات البيئة
- فحص الشبكة والاتصالات
