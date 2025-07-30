# Kasher Project - نظام إدارة المتاجر

## نظرة عامة
نظام إدارة متاجر متعدد المستأجرين (Multi-tenant) مطور بـ Node.js و Express.js مع MongoDB، مخصص لإدارة المنتجات والفواتير والمخزون والاشتراكات للمتاجر والسوبر ماركت.

## المعلومات الأساسية للمشروع

- **اسم المشروع**: Kasher Backend
- **الإصدار**: 1.0.0
- **التقنيات**: Node.js, Express.js, MongoDB, JWT Authentication
- **نوع النظام**: Multi-tenant Cashier System
- **البيئة**: Production Ready (Vercel Compatible)

## هيكل البيانات الأساسي

### نماذج البيانات (Models)
- **User**: إدارة المستخدمين (Admin, SuperAdmin)
- **Product**: إدارة المنتجات
- **Invoice**: إدارة الفواتير
- **Category**: تصنيفات المنتجات
- **Subscription**: إدارة الاشتراكات
- **Blacklist**: قائمة التوكنات المحظورة
- **Token**: إدارة Refresh Tokens

### أنواع المستخدمين
1. **Admin**: مدير المتجر
2. **SuperAdmin**: المدير العام للنظام

---

# توثيق الـ API Endpoints

## Base URL
```
Production: https://your-domain.vercel.app/api
Development: http://localhost:3000/api
```

---

## 🔐 Authentication Endpoints
**Base Route**: `/api/auth`

### 1. تسجيل مستخدم جديد (Admin)
```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "firstName": "string (required)",
  "lastName": "string (required)", 
  "companyName": "string (required)",
  "companyAddress": "string (required)",
  "phone": "string (required)",
  "email": "string (required, email format)",
  "password": "string (required, min 6 chars)",
  "confirmPassword": "string (required)"
}
```

**Response (201):**
```json
{
  "message": "تم التسجيل بنجاح. يرجى التحقق من بريدك الإلكتروني."
}
```

---

### 2. تفعيل الحساب عبر OTP
```http
POST /api/auth/verify-otp
```

**Request Body:**
```json
{
  "email": "string (required, email)",
  "otp": "string (required, 6 digits)"
}
```

**Response (200):**
```json
{
  "message": "Email verified successfully"
}
```

---

### 3. تسجيل الدخول
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "string (required, email)",
  "password": "string (required)"
}
```

**Response (200):**
```json
{
  "token": "jwt_access_token",
  "refreshToken": "jwt_refresh_token",
  "user": {
    "id": "user_id",
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "role": "admin|superAdmin",
    "companyName": "string",
    "isVerified": true
  }
}
```

---

### 4. نسيان كلمة المرور
```http
POST /api/auth/forgot-password
```

**Request Body:**
```json
{
  "email": "string (required, email)"
}
```

**Response (200):**
```json
{
  "message": "Reset code sent to email"
}
```

---

### 5. إعادة تعيين كلمة المرور
```http
POST /api/auth/reset-password
```

**Request Body:**
```json
{
  "email": "string (required, email)",
  "otp": "string (required, 6 digits)",
  "newPassword": "string (required, min 6 chars)",
  "confirmNewPassword": "string (required)"
}
```

**Response (200):**
```json
{
  "message": "Password reset successfully"
}
```

---

### 6. تحديث Access Token
```http
POST /api/auth/refresh-token
```

**Request Body:**
```json
{
  "refreshToken": "string (required)"
}
```

**Response (200):**
```json
{
  "token": "new_jwt_access_token"
}
```

---

### 7. تسجيل الخروج
```http
POST /api/auth/logout
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

---

## 👨‍💼 Admin Endpoints
**Base Route**: `/api/admin`
**Authentication**: Bearer Token Required
**Authorization**: Admin Role + Active Subscription

### إدارة الفئات (Categories)

#### 1. جلب جميع الفئات
```http
GET /api/admin/categories
```

#### 2. إضافة فئة جديدة
```http
POST /api/admin/categories
```
**Request Body:**
```json
{
  "name": "string (required)"
}
```

#### 3. تحديث فئة
```http
PUT /api/admin/categories/:id
```
**Request Body:**
```json
{
  "name": "string (required)"
}
```

#### 4. حذف فئة
```http
DELETE /api/admin/categories/:id
```

---

### إدارة المنتجات (Products)

#### 1. جلب جميع المنتجات
```http
GET /api/admin/products
```

#### 2. إضافة منتج جديد (مع صورة)
```http
POST /api/admin/products
```
**Content-Type**: `multipart/form-data`

**Form Data:**
```json
{
  "name": "string (required)",
  "sku": "string (required, unique per admin)",
  "originalPrice": "number (required)",
  "sellingPrice": "number (required)", 
  "quantity": "number (required, >= 0)",
  "categoryId": "string (required, ObjectId)",
  "description": "string (optional)",
  "image": "file (optional, max 5MB, images only)"
}
```

#### 3. تحديث منتج
```http
PUT /api/admin/products/:id
```
**Request Body:**
```json
{
  "name": "string (optional)",
  "sku": "string (optional)",
  "originalPrice": "number (optional)",
  "sellingPrice": "number (optional)",
  "quantity": "number (optional, >= 0)",
  "categoryId": "string (optional, ObjectId)",
  "description": "string (optional)",
  "image": "string (optional, URL)"
}
```

#### 4. تحديث صورة المنتج
```http
PUT /api/admin/products/:id/image
```
**Content-Type**: `multipart/form-data`
**Form Data:**
```json
{
  "image": "file (required, max 5MB, images only)"
}
```

#### 5. البحث في المنتجات
```http
GET /api/admin/products/search?q=search_term&category=category_name&minPrice=100&maxPrice=500
```

#### 6. حذف منتج
```http
DELETE /api/admin/products/:id
```

---

### الإحصائيات والتقارير

#### 1. إحصائيات الأدمن
```http
GET /api/admin/stats
```
**Response:**
```json
{
  "totalInvoices": 150,
  "dailyProfit": 1250.50,
  "monthlyProfit": 35000.75,
  "yearlyProfit": 420000.00
}
```

#### 2. تقارير مفصلة
```http
GET /api/admin/reports
```

#### 3. تحليلات لوحة التحكم
```http
GET /api/admin/dashboard/analytics
```

#### 4. تحليلات متقدمة مع فلاتر
```http
GET /api/admin/analytics/advanced?startDate=2024-01-01&endDate=2024-12-31
```

---

### إدارة الملف الشخصي

#### 1. جلب بيانات الملف الشخصي
```http
GET /api/admin/profile
```

#### 2. تحديث الملف الشخصي
```http
PUT /api/admin/profile
```
**Request Body:**
```json
{
  "firstName": "string (optional)",
  "lastName": "string (optional)",
  "companyName": "string (optional)",
  "companyAddress": "string (optional)",
  "phone": "string (optional)",
  "currentPassword": "string (required if changing password)",
  "newPassword": "string (optional, min 6 chars)"
}
```

#### 3. جلب أدمن بالـ ID
```http
GET /api/admin/admin/:id
```

---

## 🧾 Invoice Endpoints  
**Base Route**: `/api/admin/invoices`
**Authentication**: Bearer Token Required
**Authorization**: Admin Role + Active Subscription

#### 1. إضافة فاتورة جديدة
```http
POST /api/admin/invoices/add-invoices
```
**Request Body:**
```json
{
  "products": [
    {
      "sku": "string (required)",
      "quantity": "number (required)"
    }
  ],
  "customerName": "string (optional)"
}
```

#### 2. جلب جميع الفواتير
```http
GET /api/admin/invoices/
```

#### 3. البحث وفلترة الفواتير
```http
GET /api/admin/invoices/search?customerName=john&price=100&date=2024-01-01
```

#### 4. جلب ربح فاتورة محددة
```http
GET /api/admin/invoices/profit/:id
```

#### 5. جلب جميع الأرباح
```http
GET /api/admin/invoices/profits
```

#### 6. جلب جميع الفواتير (تفاصيل كاملة)
```http
GET /api/admin/all-invoices
```

#### 7. قائمة الفواتير
```http
GET /api/admin/invoices
```

---

## 📦 Inventory Endpoints
**Base Route**: `/api/inventory`
**Authentication**: Bearer Token Required  
**Authorization**: Admin Role + Active Subscription

#### 1. جلب جميع المنتجات
```http
GET /api/inventory/products
```

#### 2. إضافة منتج جديد
```http
POST /api/inventory/products
```
**Content-Type**: `multipart/form-data`
**Form Data:** (نفس بيانات `/api/admin/products`)

#### 3. تحديث منتج
```http
PUT /api/inventory/products/:id
```

#### 4. تحديث صورة المنتج
```http
PUT /api/inventory/products/:id/image
```

#### 5. حذف منتج
```http
DELETE /api/inventory/products/:id
```

#### 6. البحث في المنتجات
```http
GET /api/inventory/products/search?q=search&category=electronics&minPrice=50&maxPrice=200
```

#### 7. إحصائيات المخزون
```http
GET /api/inventory/stats
```

#### 8. تقرير المخزون
```http
GET /api/inventory/report?startDate=2024-01-01&endDate=2024-12-31&category=electronics
```

#### 9. منتجات قليلة المخزون
```http
GET /api/inventory/low-stock?threshold=10
```

---

## 🔧 SuperAdmin Endpoints
**Base Route**: `/api/superAdmin`  
**Authentication**: Bearer Token Required
**Authorization**: SuperAdmin Role Only

### إدارة المستخدمين

#### 1. إحصائيات السوبر أدمن
```http
GET /api/superAdmin/stats
```

#### 2. إنشاء أدمن جديد
```http
POST /api/superAdmin/users/admin
```
**Request Body:**
```json
{
  "firstName": "string (required)",
  "lastName": "string (required)",
  "companyName": "string (required)",
  "companyAddress": "string (required)", 
  "phone": "string (required)",
  "email": "string (required, email)",
  "password": "string (required, min 6 chars)"
}
```

#### 3. تحديث أدمن
```http
PUT /api/superAdmin/users/admin/:id
```

#### 4. حذف أدمن
```http
DELETE /api/superAdmin/users/admin/:id
```

#### 5. جلب جميع الأدمنز
```http
GET /api/superAdmin/users/admins
```

#### 6. جلب أدمن بالـ ID
```http
GET /api/superAdmin/users/admin/:id
```

---

### التقارير العامة

#### 1. تقرير عام شامل
```http
GET /api/superAdmin/reports/global
```

---

### إدارة الاشتراكات

#### 1. جلب جميع الاشتراكات
```http
GET /api/superAdmin/subscriptions
```

#### 2. الموافقة/رفض اشتراك
```http
POST /api/superAdmin/subscriptions/:subscriptionId/approve
```
**Request Body:**
```json
{
  "status": "approved|rejected (required)",
  "rejectionReason": "string (required if status=rejected)"
}
```

---

### إرسال الإشعارات

#### 1. إرسال إشعار للمستخدمين
```http
POST /api/superAdmin/notifications/send
```
**Request Body:**
```json
{
  "recipients": {
    "type": "all|specific|verified|unverified (required)",
    "userIds": ["array of user IDs (required if type=specific)"]
  },
  "subject": "string (required)",
  "message": "string (required)",
  "type": "email (optional)"
}
```

---

### إدارة المنتجات والفواتير (عرض شامل)

#### 1. جلب جميع المنتجات عبر كل الأدمنز
```http
GET /api/superAdmin/products?adminId=xxx&categoryId=xxx&page=1&limit=50&minPrice=100&maxPrice=500
```

#### 2. جلب جميع الفواتير عبر كل الأدمنز  
```http
GET /api/superAdmin/invoices?adminId=xxx&page=1&limit=50&minAmount=100&maxAmount=1000&startDate=2024-01-01&endDate=2024-12-31
```

#### 3. جلب منتجات أدمن محدد
```http
GET /api/superAdmin/admins/:id/products?categoryId=xxx&page=1&limit=50&minPrice=100&maxPrice=500
```

#### 4. جلب فواتير أدمن محدد
```http
GET /api/superAdmin/admins/:id/invoices?page=1&limit=50&minAmount=100&maxAmount=1000&startDate=2024-01-01&endDate=2024-12-31
```

---

## 💳 Subscription Endpoints
**Base Route**: `/api/subscriptions`

#### 1. رفع إيصال اشتراك (Admin)
```http
POST /api/subscriptions/subscriptions/upload
```
**Authentication**: Bearer Token Required (Admin)
**Content-Type**: `multipart/form-data`

**Form Data:**
```json
{
  "plan": "monthly|yearly|custom (required)",
  "paidAmountText": "string (required)",
  "duration": "month|year|custom (required)",
  "price": "number (required)",
  "startDate": "string (required, date)",
  "endDate": "string (required, date)",
  "receipt": "file (required, receipt image)"
}
```

#### 2. جلب جميع الاشتراكات (SuperAdmin)
```http
GET /api/subscriptions/
```
**Authentication**: Bearer Token Required (SuperAdmin)

#### 3. الموافقة/رفض اشتراك (SuperAdmin)
```http
POST /api/subscriptions/:subscriptionId/approve
```
**Authentication**: Bearer Token Required (SuperAdmin)
**Request Body:**
```json
{
  "status": "approved|rejected (required)",
  "rejectionReason": "string (required if status=rejected)"
}
```

---

## 🏥 Health & Utility Endpoints

#### 1. فحص حالة النظام
```http
GET /api/health
```
**Response:**
```json
{
  "status": "success",
  "message": "API is working perfectly! 🚀",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "environment": "production",
  "version": "1.0.0",
  "database": "connected"
}
```

#### 2. الصفحة الرئيسية
```http
GET /
```
**Response:**
```json
{
  "message": "مرحباً بك في نظام إدارة المتاجر - Kasher Project",
  "status": "API is running successfully",
  "endpoints": {
    "health": "/api/health",
    "auth": "/api/auth",
    "admin": "/api/admin",
    "superAdmin": "/api/superAdmin",
    "subscriptions": "/api/subscriptions",
    "inventory": "/api/inventory"
  },
  "timestamp": "2024-01-01T00:00:00.000Z",
  "server": "Node.js + Express",
  "database": "MongoDB"
}
```

---

## 🔒 Security & Authentication

### Middleware المستخدم
- **CORS**: للسماح بالطلبات من مختلف الدومينات
- **Helmet**: لحماية الـ headers
- **XSS Clean**: لمنع XSS attacks
- **Rate Limiting**: للحد من عدد الطلبات (100 طلب/15 دقيقة)
- **JWT Authentication**: للمصادقة
- **Role-based Authorization**: للتحكم في الصلاحيات
- **Subscription Check**: للتحقق من صحة الاشتراك

### أنواع التوكنات
- **Access Token**: صالح لمدة ساعة واحدة
- **Refresh Token**: صالح لمدة 7 أيام

### استثناءات Rate Limiting
- مسارات المنتجات `/api/admin/products`
- مسارات السوبر أدمن `/api/superAdmin`

---

## 📝 أكواد الاستجابة

### Success Codes
- **200**: نجح الطلب
- **201**: تم الإنشاء بنجاح

### Error Codes  
- **400**: خطأ في البيانات المرسلة
- **401**: غير مصرح (Authentication required)
- **403**: ممنوع (Insufficient permissions)
- **404**: غير موجود
- **500**: خطأ في الخادم

---

## 📋 ملاحظات مهمة

### للأدمن (Admin):
- يجب التحقق من البريد الإلكتروني قبل الوصول للنظام
- يحتاج اشتراك نشط للوصول لمعظم الوظائف
- لا يمكن الوصول لمسارات السوبر أدمن

### للسوبر أدمن (SuperAdmin):
- لا يحتاج للتحقق من الاشتراك
- يمكنه إنشاء وإدارة الأدمنز
- يمكنه عرض جميع البيانات عبر النظام
- يمكنه الموافقة/رفض الاشتراكات

### Upload Files:
- الحد الأقصى لحجم الملف: 5MB
- أنواع الملفات المسموحة: صور فقط
- يتم استخدام Cloudinary لتخزين الصور
- Memory storage للتوافق مع Vercel

### Database:
- MongoDB مع Mongoose ODM
- Multi-tenant architecture
- Unique indexes للـ SKU per admin
- Unique indexes للـ invoice numbers per admin

---

## 🚀 Development & Deployment

### Scripts المتاحة
```bash
npm start          # تشغيل الخادم
npm run dev        # تشغيل في وضع التطوير مع nodemon
npm run build      # بناء المشروع
npm run vercel-build # بناء للنشر على Vercel
```

### Environment Variables
```env
PORT=3000
MONGO_URI=mongodb://...
JWT_SECRET=your_jwt_secret
REFRESH_TOKEN_SECRET=your_refresh_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NODE_ENV=production
```

### Dependencies
- **Backend**: Express.js, Mongoose, JWT
- **Security**: Helmet, XSS-Clean, Rate Limiting  
- **File Upload**: Multer, Cloudinary
- **Email**: Nodemailer
- **Validation**: Express Validator
- **Logging**: Winston, Morgan

---

## 📞 دعم وتطوير

هذا النظام جاهز للإنتاج ومتوافق مع:
- ✅ Vercel Deployment
- ✅ MongoDB Atlas
- ✅ Cloudinary CDN
- ✅ Multi-tenant Architecture
- ✅ JWT Authentication
- ✅ Role-based Access Control
- ✅ File Upload Management
- ✅ Email Notifications
- ✅ Comprehensive API Documentation

---

**📋 Total Endpoints**: 50+ endpoint موزعة على 6 modules رئيسية

**🔐 Security Level**: Enterprise Grade

**⚡ Performance**: Optimized for Production

**🏗️ Architecture**: Scalable Multi-tenant System
