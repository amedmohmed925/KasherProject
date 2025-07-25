# نظام إدارة المتاجر - Kasher Project

## 📝 تقرير التحليل والمراجعة

### ✅ **المشاكل التي تم إصلاحها:**
1. استخدام `tenantId` بدلاً من `adminId` في عدة controllers
2. إصلاح JWT token ليتضمن `adminId` فقط
3. توحيد جميع العمليات لتستخدم `adminId`

### 🚀 **النظام بعد الإصلاح - جميع Endpoints تعمل بشكل صحيح**

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

---

## البنية التقنية

### التقنيات المستخدمة
- **Backend**: Node.js + Express.js
- **Database**: MongoDB + Mongoose
- **Authentication**: JWT + Refresh Tokens
- **Security**: Helmet, XSS-Clean, Rate Limiting
- **Email**: NodeMailer
- **File Upload**: Multer + Cloudinary
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

### 1.1 التسجيل
```http
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "محمد",
  "lastName": "أحمد", 
  "phone": "01234567890",
  "email": "admin@example.com",
  "password": "password123",
  "confirmPassword": "password123"
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

### 2.2 جلب بيانات أدمن بالـ ID
```http
GET /api/admin/admin/:id
Authorization: Bearer <token>
```

### 2.3 إحصائيات لوحة التحكم المتقدمة
```http
GET /api/admin/dashboard/analytics
Authorization: Bearer <token>
```

### 2.4 تقارير مخصصة
```http
GET /api/admin/reports?type=daily&startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer <token>
```

### 2.5 قائمة الفواتير مع فلترة
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

### 3.2 إضافة منتج جديد
```http
POST /api/admin/products
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "حليب نادك",
  "sku": "NADEC001",
  "originalPrice": 5.50,
  "sellingPrice": 7.00,
  "quantity": 100,
  "category": "منتجات ألبان",
  "description": "حليب طازج كامل الدسم",
  "image": "https://example.com/image.jpg"
}
```

### 3.3 تحديث منتج
```http
PUT /api/admin/products/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "حليب نادك محدث",
  "quantity": 150,
  "sellingPrice": 7.50
}
```

### 3.4 حذف منتج
```http
DELETE /api/admin/products/:id
Authorization: Bearer <token>
```

### 3.5 البحث في المنتجات
```http
GET /api/admin/products/search?name=حليب&category=ألبان&minPrice=5&maxPrice=10
Authorization: Bearer <token>
```

---

## 📂 4. Categories Management

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

# إضافة منتج
POST /api/inventory/products
Authorization: Bearer <token>

# تحديث منتج  
PUT /api/inventory/products/:id
Authorization: Bearer <token>

# حذف منتج
DELETE /api/inventory/products/:id
Authorization: Bearer <token>

# البحث في المنتجات
GET /api/inventory/products/search
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

#### إنشاء أدمن جديد
```http
POST /api/superAdmin/users/admin
Authorization: Bearer <superAdmin_token>
Content-Type: application/json

{
  "firstName": "محمد",
  "lastName": "أحمد",
  "email": "admin@example.com",
  "password": "password123"
}
```

#### تحديث أدمن
```http
PUT /api/superAdmin/users/admin/:id
Authorization: Bearer <superAdmin_token>
```

#### حذف أدمن
```http
DELETE /api/superAdmin/users/admin/:id
Authorization: Bearer <superAdmin_token>
```

### 8.3 إدارة الاشتراكات

#### جلب جميع الاشتراكات
```http
GET /api/subscriptions/
Authorization: Bearer <superAdmin_token>
```

#### الموافقة على اشتراك أو رفضه
```http
POST /api/subscriptions/:subscriptionId/approve
Authorization: Bearer <superAdmin_token>
Content-Type: application/json

{
  "status": "approved", // أو "rejected"
  "rejectionReason": "سبب الرفض" // مطلوب في حالة الرفض
}
```

### 8.4 التقارير العامة
```http
GET /api/superAdmin/reports/global
Authorization: Bearer <superAdmin_token>
```

---

## 🗄️ قاعدة البيانات - النماذج

### User Schema
```javascript
{
  firstName: String,       // الاسم الأول
  lastName: String,        // الاسم الأخير  
  email: String,           // البريد الإلكتروني (unique)
  password: String,        // كلمة المرور المشفرة
  role: String,            // admin | superAdmin
  phone: String,           // رقم الهاتف
  isVerified: Boolean,     // حالة التفعيل
  otp: String,            // رمز التحقق
  companyName: String,     // اسم الشركة
  companyAddress: String,  // عنوان الشركة
  createdAt: Date
}
```

### Product Schema
```javascript
{
  adminId: ObjectId,       // معرف الأدمن (ref: User)
  name: String,            // اسم المنتج
  sku: String,             // رمز المنتج (unique per admin)
  originalPrice: Number,   // السعر الأصلي
  sellingPrice: Number,    // سعر البيع
  quantity: Number,        // الكمية
  category: String,        // الفئة
  description: String,     // الوصف
  image: String,           // رابط الصورة
  createdAt: Date,
  updatedAt: Date
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
