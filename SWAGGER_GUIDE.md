# Swagger API Documentation - دليل الاستخدام

## تم إضافة توثيق Swagger شامل لنظام Kasher Project! 🎉

### 📋 ما تم إضافته:

#### 1. **إعداد Swagger**
- ملف `swagger.js` مع التكوين الكامل
- إضافة dependencies في `package.json`:
  - `swagger-jsdoc`: ^6.2.8
  - `swagger-ui-express`: ^5.0.0

#### 2. **Schema Definitions شاملة**
- **User Schema**: نموذج المستخدمين
- **Product Schema**: نموذج المنتجات  
- **Category Schema**: نموذج الفئات
- **Invoice Schema**: نموذج الفواتير
- **Subscription Schema**: نموذج الاشتراكات
- **Request/Response Schemas**: نماذج الطلبات والاستجابات
- **Error/Success Schemas**: نماذج الأخطاء والنجاح
- **Pagination Schema**: نموذج ترقيم الصفحات

#### 3. **توثيق مفصل لجميع الـ Routes**

##### 🔐 **Authentication Routes** (7 endpoints)
- `POST /auth/register` - تسجيل مستخدم جديد
- `POST /auth/login` - تسجيل الدخول  
- `POST /auth/verify-otp` - تفعيل الحساب
- `POST /auth/forgot-password` - نسيان كلمة المرور
- `POST /auth/reset-password` - إعادة تعيين كلمة المرور
- `POST /auth/logout` - تسجيل الخروج
- `POST /auth/refresh-token` - تحديث رمز الوصول

##### 👨‍💼 **Admin Routes** (20+ endpoints)
- **إدارة الفئات**: CRUD كامل
- **إدارة المنتجات**: مع رفع الصور
- **الإحصائيات والتقارير**: تحليلات شاملة
- **إدارة الملف الشخصي**: تحديث البيانات

##### 🧾 **Invoice Routes** (5 endpoints)
- إضافة وإدارة الفواتير
- البحث والفلترة
- حساب الأرباح

##### 📦 **Inventory Routes** (9 endpoints)  
- إدارة المخزون الكاملة
- تقارير المخزون
- منتجات قليلة المخزون

##### 🔧 **SuperAdmin Routes** (15+ endpoints)
- إدارة المستخدمين
- التقارير العامة
- إدارة الاشتراكات
- إرسال الإشعارات

##### 💳 **Subscription Routes** (3 endpoints)
- رفع إيصالات الاشتراك
- الموافقة والرفض

#### 4. **ملفات YAML منظمة**
- `admin-routes.yaml` - توثيق مسارات الأدمن
- `invoices-routes.yaml` - توثيق مسارات الفواتير
- `inventory-routes.yaml` - توثيق مسارات المخزون
- `superadmin-routes.yaml` - توثيق مسارات السوبر أدمن
- `subscriptions-routes.yaml` - توثيق مسارات الاشتراكات

### 🚀 كيفية الوصول للتوثيق:

#### في Development:
```
http://localhost:3000/api-docs
```

#### في Production:
```
https://your-domain.vercel.app/api-docs
```

### 🔧 التشغيل:

#### 1. تثبيت Dependencies الجديدة:
```bash
npm install swagger-jsdoc swagger-ui-express
```

#### 2. تشغيل المشروع:
```bash
# Development
npm run dev

# Production
npm start
```

#### 3. فتح المتصفح والذهاب إلى:
```
http://localhost:3000/api-docs
```

### 🎯 المميزات المضافة:

#### ✅ **التوثيق التفاعلي**
- واجهة Swagger UI جميلة ومنظمة
- إمكانية تجربة الـ APIs مباشرة
- أمثلة واقعية لجميع الطلبات

#### ✅ **Security Schemas**
- دعم JWT Bearer Authentication
- توثيق متطلبات الأمان لكل endpoint

#### ✅ **تصنيف منظم**
- تجميع الـ endpoints حسب الوظيفة
- tags واضحة ومنطقية

#### ✅ **تفاصيل شاملة**
- وصف مفصل لكل parameter
- أمثلة واقعية للـ request/response
- توضيح أكواد الأخطاء المحتملة

#### ✅ **دعم File Upload**
- توثيق endpoints رفع الصور
- تحديد أنواع الملفات المقبولة
- حدود الحجم

### 📊 الإحصائيات:

- **إجمالي Endpoints**: 50+ endpoint
- **Security Schemas**: JWT Bearer Auth
- **Request Schemas**: 15+ schema
- **Response Schemas**: 20+ schema
- **YAML Documentation Files**: 5 ملفات منظمة

### 🔍 ميزات إضافية:

#### **Root Endpoint محدث**
- إضافة رابط التوثيق: `/api-docs`
- معلومات شاملة عن النظام

#### **Custom UI**
- إخفاء شريط العلوي
- عنوان مخصص: "Kasher Project API Documentation"
- تصميم نظيف ومهني

### 📝 نصائح الاستخدام:

1. **للمطورين**: استخدم التوثيق لفهم جميع الـ APIs المتاحة
2. **للاختبار**: جرب الـ endpoints مباشرة من الواجهة
3. **للتطوير**: راجع الـ schemas للتأكد من صحة البيانات
4. **للنشر**: التوثيق متاح تلقائياً في بيئة الإنتاج

### 🎊 النتيجة النهائية:

الآن لديك **توثيق API شامل ومهني** يغطي:
- ✅ جميع الـ 50+ endpoints
- ✅ نماذج البيانات الكاملة  
- ✅ أمثلة واقعية
- ✅ دعم الأمان والتوثيق
- ✅ واجهة تفاعلية جميلة
- ✅ تنظيم منطقي ومنهجي

**🚀 جاهز للاستخدام والمشاركة مع الفريق!**
