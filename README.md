# نظام إدارة المتاجر - Kasher Project

## 📝 تقرير التحليل والمراجعة

### ✅ **المشاكل التي تم إصلاحها:**
1. استخدام `tenantId` بدلاً من `adminId` في عدة controllers
2. إصلاح JWT token ليتضمن `adminId` فقط
3. توحيد جميع العمليات لتستخدم `adminId`

### 🚀### 2.5 قائمة الفواتير مع فلترة
```http
GET /api/admin/invoices/list?page=1&limit=10&date=2024-01-01
Authorization: Bearer <token>
```

### 2.6 إدارة الملف الشخصي

#### جلب بيانات الملف الشخصي
```http
GET /api/admin/profile
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "admin": {
    "id": "507f1f77bcf86cd799439011",
    "firstName": "محمد",
    "lastName": "أحمد",
    "companyName": "متجر الأمانة",
    "companyAddress": "شارع الجامعة، القاهرة، مصر",
    "email": "admin@example.com",
    "phone": "01234567890",
    "role": "admin",
    "isVerified": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### تحديث الملف الشخصي
```http
PUT /api/admin/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "محمد محدث",
  "lastName": "أحمد محدث", 
  "companyName": "متجر الأمانة المحدث",
  "companyAddress": "العنوان الجديد",
  "phone": "01987654321",
  "currentPassword": "oldpassword123", // مطلوب فقط لتغيير كلمة المرور
  "newPassword": "newpassword123" // اختياري
}
```

### 2.7 التحليلات المتقدمة

#### تحليلات متقدمة مع فلاتر
```http
GET /api/admin/analytics/advanced?period=month&startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer <token>
```

**المعايير المتاحة:**
- `period`: week | month | year (افتراضي: month)
- `startDate`, `endDate`: نطاق تاريخ مخصص

**Response:**
```json
{
  "success": true,
  "period": "month",
  "dateRange": {
    "$gte": "2024-01-01T00:00:00.000Z",
    "$lte": "2024-12-31T23:59:59.999Z"
  },
  "invoiceStats": {
    "totalInvoices": 150,
    "totalRevenue": 75000.00,
    "averageInvoiceValue": 500.00
  },
  "inventoryStats": {
    "totalProducts": 200,
    "totalQuantity": 5000,
    "totalValue": 125000.00,
    "lowStockProducts": 15,
    "outOfStockProducts": 3
  },
  "topProducts": [
    {
      "_id": "productId",
      "productName": "حليب نادك",
      "totalSold": 100,
      "totalRevenue": 700.00
    }
  ],
  "categoryStats": [...],
  "dailySales": [...]
}
```نظام بعد الإصلاح - جميع Endpoints تعمل بشكل صحيح**

---

## وصف النظام

نظام إدارة شامل للمتاجر والسوبر ماركت يوفر حلول متكاملة لإدارة المخزون والفواتير والعملاء مع نظام اشتراكات مرن.

### المميزات الرئيسية
- 🔐 نظام أمان متقدم مع JWT وحماية من XSS
- 👥 إدارة أدوار المستخدمين (Admin/Super Admin)
- 📦 إدارة مخزون شاملة مع تنبيهات الكميات المنخفضة
- 🧾 نظام فواتير متطور مع تتبع الأرباح
- 📊 تقارير وإحصائيات تفصيلية
- 💳 نظام اشتراكات مع خطط متعددة (Trial/Monthly/Yearly)
- 📧 نظام إشعارات بالبريد الإلكتروني
- 🔄 حماية من Rate Limiting
- 🖼️ رفع وإدارة صور المنتجات مع Cloudinary
- 🗂️ ربط المنتجات بالفئات عبر ObjectId References

---

## البنية التقنية

### التقنيات المستخدمة
- **Backend**: Node.js + Express.js
- **Database**: MongoDB + Mongoose
- **Authentication**: JWT + Refresh Tokens
- **Security**: Helmet, XSS-Clean, Rate Limiting
- **Email**: NodeMailer
- **File Upload**: Multer + Cloudinary (رفع الصور مع تحسين تلقائي)
- **Image Storage**: Cloudinary (تخزين سحابي مع تحسين وضغط الصور)
- **Validation**: Express-Validator

---

## 🔒 نظام الحماية والأمان

### JWT Token Structure
```json
{
  "id": "user_id",
  "role": "admin|superAdmin"
}
```

### Rate Limiting
- **العام**: 100 طلب كل 15 دقيقة
- **استثناءات**: `/api/admin/products/*` و `/api/superAdmin/*`

---

## 🌐 API Endpoints - دليل شامل

### Base URL
```
Development: http://localhost:3000/api
```

---

## 🔑 1. Authentication Endpoints

### 📋 **متطلبات التسجيل:**
- ✅ الاسم الأول والأخير
- ✅ اسم الشركة وعنوانها (جديد!)
- ✅ رقم الهاتف
- ✅ البريد الإلكتروني
- ✅ كلمة المرور (6 أحرف على الأقل)
- ✅ تأكيد كلمة المرور

### 1.1 التسجيل
```http
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "محمد",
  "lastName": "أحمد",
  "companyName": "متجر الأمانة",
  "companyAddress": "شارع الجامعة، القاهرة، مصر",
  "phone": "01234567890",
  "email": "admin@example.com", 
  "password": "password123",
  "confirmPassword": "password123"
}
```

**Response:**
```json
{
  "message": "تم التسجيل بنجاح. يرجى التحقق من بريدك الإلكتروني."
}
```

### 1.2 تسجيل الدخول
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password123"
}
```

### 1.3 تفعيل الحساب
```http
POST /api/auth/verify-otp
Content-Type: application/json

{
  "email": "admin@example.com",
  "otp": "123456"
}
```

### 1.4 نسيان كلمة المرور
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "admin@example.com"
}
```

### 1.5 إعادة تعيين كلمة المرور
```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "email": "admin@example.com",
  "otp": "123456",
  "newPassword": "newpassword123",
  "confirmNewPassword": "newpassword123"
}
```

### 1.6 تحديث Token
```http
POST /api/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

### 1.7 تسجيل الخروج
```http
POST /api/auth/logout
Authorization: Bearer <token>
```

---

## 👨‍💼 2. Admin Endpoints

**جميع endpoints تتطلب**: `Authorization: Bearer <token>`

### 2.1 إحصائيات الأدمن
```http
GET /api/admin/stats
Authorization: Bearer <token>
```
**Response:**
```json
{
  "invoicesCount": 25,
  "todayProfit": 1500.50,
  "monthProfit": 45000.75,
  "yearProfit": 540000.00
}
```

### 2.2 إحصائيات لوحة التحكم المتقدمة
```http
GET /api/admin/dashboard/analytics
Authorization: Bearer <token>
```

### 2.3 تحليلات متقدمة مع فلاتر
```http
GET /api/admin/analytics/advanced?period=month&startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer <token>
```
**Parameters:**
- `period`: week | month | year
- `startDate`: تاريخ البداية (اختياري)
- `endDate`: تاريخ النهاية (اختياري)

**Response:**
```json
{
  "success": true,
  "period": "month",
  "invoiceStats": {
    "totalInvoices": 150,
    "totalRevenue": 75000.00,
    "averageInvoiceValue": 500.00
  },
  "inventoryStats": {
    "totalProducts": 200,
    "totalQuantity": 1500,
    "totalValue": 300000.00,
    "lowStockProducts": 15,
    "outOfStockProducts": 3
  },
  "topProducts": [...],
  "categoryStats": [...],
  "dailySales": [...]
}
```

### 2.4 إدارة الملف الشخصي

#### جلب بيانات الملف الشخصي
```http
GET /api/admin/profile
Authorization: Bearer <token>
```

#### تحديث الملف الشخصي
```http
PUT /api/admin/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "محمد",
  "lastName": "أحمد",
  "companyName": "متجر الأمانة المحدث",
  "companyAddress": "العنوان الجديد",
  "phone": "01234567890",
  "currentPassword": "current123", // مطلوب فقط لتغيير كلمة المرور
  "newPassword": "newpassword123"  // اختياري
}
```

### 2.5 جلب بيانات أدمن بالـ ID
```http
GET /api/admin/admin/:id
Authorization: Bearer <token>
```

### 2.6 تقارير مخصصة
```http
GET /api/admin/reports?type=daily&startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer <token>
```

### 2.7 قائمة الفواتير مع فلترة
```http
GET /api/admin/invoices/list?page=1&limit=10&date=2024-01-01
Authorization: Bearer <token>
```

---

## 📦 3. Products Management

### 3.1 جلب جميع المنتجات
```http
GET /api/admin/products
Authorization: Bearer <token>
```

### 3.2 إضافة منتج جديد مع رفع الصور
```http
POST /api/admin/products
Authorization: Bearer <token>
Content-Type: multipart/form-data

Form Data:
name: حليب نادك
sku: NADEC001
originalPrice: 5.50
sellingPrice: 7.00
quantity: 100
categoryId: 507f1f77bcf86cd799439011
description: حليب طازج كامل الدسم
image: [file] (اختياري - صورة المنتج، حد أقصى 5MB)
```

**ملاحظات مهمة:** 
- يجب إضافة الفئات أولاً قبل إضافة المنتجات، واستخدام `categoryId` من الفئات المضافة
- رفع الصور اختياري ويتم حفظها على Cloudinary مع تحسين تلقائي
- الصور المقبولة: jpg, png, gif, webp (حد أقصى 5MB)

### 3.3 تحديث منتج
```http
PUT /api/admin/products/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "حليب نادك محدث",
  "quantity": 150,
  "sellingPrice": 7.50,
  "categoryId": "507f1f77bcf86cd799439011"
}
```
**ملاحظة:** جميع الحقول اختيارية - يتم تحديث الحقول المرسلة فقط

### 3.4 تحديث صورة المنتج فقط
```http
PUT /api/admin/products/:id/image
Authorization: Bearer <token>
Content-Type: multipart/form-data

Form Data:
image: [file] (مطلوب - صورة المنتج الجديدة، حد أقصى 5MB)
```
**ملاحظة:** يتم حذف الصورة القديمة تلقائياً من Cloudinary

### 3.5 حذف منتج
```http
DELETE /api/admin/products/:id
Authorization: Bearer <token>
```

### 3.6 البحث في المنتجات
```http
GET /api/admin/products/search?q=حليب&category=ألبان&minPrice=5&maxPrice=10
Authorization: Bearer <token>
```

**معايير البحث:**
- `q`: البحث في اسم المنتج أو الوصف
- `category`: البحث حسب الفئة
- `minPrice`: الحد الأدنى للسعر
- `maxPrice`: الحد الأقصى للسعر

---

## 📂 4. Categories Management

### 🔄 **Workflow إضافة منتج مع الصور:**
1. **أولاً:** إضافة فئة (Categories)
2. **ثانياً:** إضافة منتج مع ربطه بالفئة (categoryId) ورفع الصورة
3. **اختياري:** تحديث صورة المنتج لاحقاً

### 4.1 جلب جميع الفئات
```http
GET /api/admin/categories
Authorization: Bearer <token>
```

### 4.2 إضافة فئة جديدة
```http
POST /api/admin/categories
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "منتجات ألبان"
}
```

**Response:**
```json
{
  "message": "Category created",
  "category": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "منتجات ألبان",
    "adminId": "507f1f77bcf86cd799439010",
    "createdAt": "2024-01-01T12:00:00.000Z"
  }
}
```

**💡 نصيحة:** احفظ الـ `_id` لاستخدامه كـ `categoryId` عند إضافة المنتجات!

### 4.3 تحديث فئة
```http
PUT /api/admin/categories/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "منتجات الألبان والأجبان"
}
```

### 4.4 حذف فئة
```http
DELETE /api/admin/categories/:id
Authorization: Bearer <token>
```

---

## 🧾 5. Invoices Management

### 5.1 جلب جميع الفواتير
```http
GET /api/admin/invoices
Authorization: Bearer <token>
```

### 5.2 إضافة فاتورة جديدة
```http
POST /api/admin/invoices/add-invoices
Authorization: Bearer <token>
Content-Type: application/json

{
  "products": [
    {
      "sku": "NADEC001", 
      "quantity": 2
    }
  ],
  "customerName": "أحمد محمد"
}
```

### 5.3 البحث في الفواتير
```http
GET /api/admin/invoices/search?customerName=أحمد&price=100&date=2024-01-01
Authorization: Bearer <token>
```

### 5.4 حساب أرباح فاتورة محددة
```http
GET /api/admin/invoices/profit/:id
Authorization: Bearer <token>
```

### 5.5 جلب جميع الأرباح
```http
GET /api/admin/invoices/profits
Authorization: Bearer <token>
```

---

## 📦 6. Inventory Management

### 6.1 إحصائيات المخزون
```http
GET /api/inventory/stats
Authorization: Bearer <token>
```

**Response:**
```json
{
  "overview": {
    "totalProducts": 500,
    "totalQuantity": 5000,
    "totalOriginalValue": 125000.00,
    "totalSellingValue": 250000.00,
    "expectedProfit": 125000.00,
    "lowStockProducts": 15,
    "outOfStockProducts": 3
  },
  "topProfitableProducts": [...]
}
```

### 6.2 تقرير المخزون المفصل
```http
GET /api/inventory/report?category=ألبان&startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer <token>
```

### 6.3 المنتجات منخفضة المخزون
```http
GET /api/inventory/low-stock?threshold=10
Authorization: Bearer <token>
```

### 6.4 إدارة المنتجات عبر Inventory
```http
# جلب جميع المنتجات
GET /api/inventory/products
Authorization: Bearer <token>

# إضافة منتج مع رفع الصورة
POST /api/inventory/products
Authorization: Bearer <token>
Content-Type: multipart/form-data

# تحديث منتج  
PUT /api/inventory/products/:id
Authorization: Bearer <token>
Content-Type: application/json

# تحديث صورة المنتج فقط
PUT /api/inventory/products/:id/image
Authorization: Bearer <token>
Content-Type: multipart/form-data

# حذف منتج
DELETE /api/inventory/products/:id
Authorization: Bearer <token>

# البحث في المنتجات
GET /api/inventory/products/search?q=نص البحث&category=الفئة&minPrice=5&maxPrice=100
Authorization: Bearer <token>
```

---

## 💳 7. Subscriptions Management

### 7.1 رفع إيصال الاشتراك
```http
POST /api/subscriptions/subscriptions/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "plan": "monthly",
  "paidAmountText": "49 جنيه",
  "duration": "month",
  "price": 49,
  "startDate": "2024-01-01",
  "endDate": "2024-02-01",
  "receipt": [file],
  "customNotes": "ملاحظات إضافية"
}
```

### أسعار الاشتراكات
- **Trial**: مجاني لمدة 30 يوم (السعر: 0)
- **Monthly**: 49 جنيه شهرياً
- **Yearly**: 499 جنيه سنوياً  
- **Custom**: حسب الاتفاق

---

## 👑 8. Super Admin Endpoints

**جميع endpoints تتطلب**: `Authorization: Bearer <superAdmin_token>`

### 8.1 إحصائيات السوبر أدمن
```http
GET /api/superAdmin/stats
Authorization: Bearer <superAdmin_token>
```

### 8.2 إدارة الأدمن

#### جلب جميع الأدمن
```http
GET /api/superAdmin/users/admins
Authorization: Bearer <superAdmin_token>
```

#### جلب أدمن بالـ ID
```http
GET /api/superAdmin/users/admin/:id
Authorization: Bearer <superAdmin_token>
```

#### إنشاء أدمن جديد
```http
POST /api/superAdmin/users/admin
Authorization: Bearer <superAdmin_token>
Content-Type: application/json

{
  "firstName": "محمد",
  "lastName": "أحمد",
  "companyName": "متجر الأمانة",
  "companyAddress": "شارع الجامعة، القاهرة، مصر",
  "phone": "01234567890",
  "email": "admin@example.com",
  "password": "password123"
}
```

#### تحديث أدمن
```http
PUT /api/superAdmin/users/admin/:id
Authorization: Bearer <superAdmin_token>
Content-Type: application/json

{
  "firstName": "محمد محدث",
  "companyName": "متجر الأمانة المحدث"
}
```

#### حذف أدمن
```http
DELETE /api/superAdmin/users/admin/:id
Authorization: Bearer <superAdmin_token>
```

### 8.3 إدارة الاشتراكات

#### جلب جميع الاشتراكات
```http
GET /api/superAdmin/subscriptions
Authorization: Bearer <superAdmin_token>
```

#### الموافقة على اشتراك أو رفضه
```http
POST /api/superAdmin/subscriptions/:subscriptionId/approve
Authorization: Bearer <superAdmin_token>
Content-Type: application/json

{
  "status": "approved", // أو "rejected"
  "rejectionReason": "سبب الرفض" // مطلوب في حالة الرفض
}
```

### 8.4 إرسال الإشعارات

#### إرسال إشعارات للمستخدمين
```http
POST /api/superAdmin/notifications/send
Authorization: Bearer <superAdmin_token>
Content-Type: application/json

{
  "recipients": {
    "type": "all", // أو "specific" أو "verified" أو "unverified"
    "userIds": ["userId1", "userId2"] // مطلوب فقط إذا كان type = "specific"
  },
  "subject": "موضوع الإشعار",
  "message": "نص الرسالة",
  "type": "email"
}
```

**أنواع المستقبلين:**
- `all`: جميع الأدمن
- `specific`: أدمن محددين بالـ ID
- `verified`: الأدمن المفعلين فقط
- `unverified`: الأدمن غير المفعلين

### 8.5 عرض المنتجات والفواتير

#### عرض جميع المنتجات عبر جميع الأدمنز
```http
GET /api/superAdmin/products?adminId=123&categoryId=456&search=حليب&minPrice=10&maxPrice=100&page=1&limit=20
Authorization: Bearer <superAdmin_token>
```

**المعايير المتاحة:**
- `adminId`: فلترة حسب أدمن محدد
- `categoryId`: فلترة حسب فئة محددة
- `search`: البحث في اسم المنتج أو SKU أو الوصف
- `minPrice`, `maxPrice`: نطاق السعر
- `minQuantity`, `maxQuantity`: نطاق الكمية
- `page`, `limit`: الصفحات
- `sortBy`, `sortOrder`: الترتيب

#### عرض جميع الفواتير عبر جميع الأدمنز
```http
GET /api/superAdmin/invoices?adminId=123&customerName=أحمد&minAmount=100&maxAmount=1000&startDate=2024-01-01&endDate=2024-12-31&page=1&limit=20
Authorization: Bearer <superAdmin_token>
```

**المعايير المتاحة:**
- `adminId`: فلترة حسب أدمن محدد
- `customerName`: البحث في اسم العميل
- `minAmount`, `maxAmount`: نطاق المبلغ
- `startDate`, `endDate`: نطاق التاريخ
- `page`, `limit`: الصفحات

#### عرض المنتجات الخاصة بأدمن محدد
```http
GET /api/superAdmin/admins/:id/products?categoryId=456&search=حليب&minPrice=10&maxPrice=100&page=1&limit=20
Authorization: Bearer <superAdmin_token>
```

#### عرض الفواتير الخاصة بأدمن محدد
```http
GET /api/superAdmin/admins/:id/invoices?customerName=أحمد&minAmount=100&maxAmount=1000&startDate=2024-01-01&endDate=2024-12-31&page=1&limit=20
Authorization: Bearer <superAdmin_token>
```

### 8.6 التقارير العامة
```http
GET /api/superAdmin/reports/global
Authorization: Bearer <superAdmin_token>
```

**Response Example:**
```json
{
  "totalAdmins": 50,
  "totalRevenue": 250000.00,
  "totalProducts": 5000,
  "activeSubscriptions": 45,
  "pendingSubscriptions": 5,
  "monthlyGrowth": "15%",
  "topPerformingAdmins": [...],
  "revenueByMonth": [...]
}
```

---

## 🗄️ قاعدة البيانات - النماذج

### User Schema
```javascript
{
  firstName: String,       // الاسم الأول (مطلوب)
  lastName: String,        // الاسم الأخير (مطلوب)
  companyName: String,     // اسم الشركة (مطلوب)
  companyAddress: String,  // عنوان الشركة (مطلوب)
  email: String,           // البريد الإلكتروني (unique, مطلوب)
  password: String,        // كلمة المرور المشفرة (مطلوب)
  role: String,            // admin | superAdmin (مطلوب)
  phone: String,           // رقم الهاتف (مطلوب)
  isVerified: Boolean,     // حالة التفعيل (افتراضي: false)
  otp: String,            // رمز التحقق
  createdAt: Date         // تاريخ الإنشاء
}
```

### Product Schema
```javascript
{
  adminId: ObjectId,       // معرف الأدمن (ref: User, مطلوب)
  name: String,            // اسم المنتج (مطلوب)
  sku: String,             // رمز المنتج (unique per admin, مطلوب)
  originalPrice: Number,   // السعر الأصلي (مطلوب)
  sellingPrice: Number,    // سعر البيع (مطلوب)
  quantity: Number,        // الكمية (مطلوب)
  categoryId: ObjectId,    // معرف الفئة (ref: Category, مطلوب)
  description: String,     // الوصف
  image: String,           // رابط الصورة
  createdAt: Date,         // تاريخ الإنشاء
  updatedAt: Date          // تاريخ التحديث
}
```

### Invoice Schema
```javascript
{
  adminId: ObjectId,       // معرف الأدمن (ref: User)
  invoiceNumber: String,   // رقم الفاتورة (unique per admin)
  customer: {
    name: String,          // اسم العميل
    phone: String          // هاتف العميل
  },
  items: [{
    productId: ObjectId,   // معرف المنتج
    sku: String,           // رمز المنتج
    name: String,          // اسم المنتج
    quantity: Number,      // الكمية
    price: Number,         // السعر
    total: Number          // الإجمالي
  }],
  totalAmount: Number,     // المبلغ الإجمالي
  createdAt: Date
}
```

### Category Schema
```javascript
{
  adminId: ObjectId,       // معرف الأدمن (ref: User)
  name: String,            // اسم الفئة
  createdAt: Date
}
```

### Subscription Schema
```javascript
{
  adminId: ObjectId,           // معرف الأدمن (ref: User)
  plan: String,                // trial | monthly | yearly | custom
  price: Number,               // السعر مع validation حسب الخطة
  startDate: Date,             // تاريخ البداية
  endDate: Date,               // تاريخ النهاية (30 يوم للتجريبي)
  status: String,              // pending | approved | rejected
  paymentConfirmed: Boolean,   // تأكيد الدفع
  receiptImage: String,        // صورة الإيصال (Cloudinary URL)
  paidAmountText: String,      // المبلغ المدفوع نصياً
  duration: String,            // trial | month | year | custom
  customNotes: String,         // ملاحظات مخصصة
  receiptFileName: String,     // اسم ملف الإيصال
  createdAt: Date
}
```

---

## 🚀 إعداد وتشغيل المشروع

### متطلبات النظام
- Node.js >= 16.0.0
- MongoDB >= 5.0.0
- npm أو yarn

### متغيرات البيئة (.env)
```env
# Database
MONGO_URI=mongodb+srv://your_connection_string

# JWT Secrets
JWT_SECRET=your_super_secret_jwt_key_here
REFRESH_TOKEN_SECRET=your_super_secret_refresh_key_here
ACCESS_TOKEN_SECRET=your_access_token_secret

# Email Configuration
EMAILTEST=your_email@gmail.com
APIKE=your_app_password

# Cloudinary (for file uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Server
PORT=3000
NODE_ENV=development
```

### تثبيت وتشغيل
```bash
# تثبيت الحزم
npm install

# تشغيل السيرفر للتطوير
npm run dev

# تشغيل السيرفر للإنتاج
npm start
```

---

## 📧 نظام الإشعارات

### إشعارات البريد الإلكتروني
- **تفعيل الحساب**: OTP مكون من 6 أرقام
- **إعادة تعيين كلمة المرور**: OTP آمن
- **حالة الاشتراك**: إشعار بالموافقة أو الرفض

---

## 🔧 Frontend Integration Examples

### Axios Setup
```javascript
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:3000/api',
  timeout: 10000,
});

// إضافة Token تلقائياً
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// معالجة انتهاء صلاحية Token
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const response = await axios.post('/auth/refresh-token', {
            refreshToken
          });
          localStorage.setItem('token', response.data.token);
          return API.request(error.config);
        } catch (refreshError) {
          localStorage.clear();
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);
```

### مثال على Login
```javascript
const login = async (email, password) => {
  try {
    const response = await API.post('/auth/login', { email, password });
    const { token, refreshToken, user } = response.data;
    
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    
    if (user.role === 'superAdmin') {
      router.push('/super-admin');
    } else {
      router.push('/admin');
    }
  } catch (error) {
    console.error('Login failed:', error.response.data.message);
  }
};
```

---

## ⚠️ ملاحظات مهمة

### الأمان
- لا تنس تغيير JWT secrets في الإنتاج
- استخدم HTTPS في الإنتاج
- قم بتحديث dependency packages بانتظام

### الأداء
- استخدم MongoDB indexes للاستعلامات السريعة
- قم بتنفيذ caching للبيانات المكررة
- راقب performance metrics باستمرار

---

## 📞 الدعم والتواصل

- **Version**: 1.0.0
- **Last Updated**: January 2024
- **Status**: ✅ جميع Endpoints تعمل بشكل صحيح بعد الإصلاح

---

*تم تحليل النظام ومراجعة جميع الـ endpoints - النظام جاهز للاستخدام! 🚀*
