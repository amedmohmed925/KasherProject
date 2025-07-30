# Vercel Deployment Guide

## مشكلة 404 NOT_FOUND

إذا واجهت خطأ `404: NOT_FOUND` على Vercel، اتبع هذه الخطوات:

### 1. ✅ تأكد من وجود ملف `vercel.json`
يجب أن يكون الملف موجود في root المشروع مع هذا المحتوى:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/server.js"
    }
  ]
}
```

### 2. 🔧 إعداد Environment Variables في Vercel

1. اذهب إلى: https://vercel.com/dashboard
2. اختر مشروعك: `kasher-project`
3. اذهب إلى: `Settings` > `Environment Variables`
4. أضف هذه المتغيرات:

```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key_here
REFRESH_TOKEN_SECRET=your_refresh_token_secret_here
ACCESS_TOKEN_SECRET=your_access_token_secret_here
EMAILTEST=your_email@gmail.com
APIKE=your_email_app_password
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
NODE_ENV=production
```

### 3. 🚀 إعادة الـ Deployment

بعد إضافة المتغيرات:
1. اذهب إلى: `Deployments`
2. اضغط على `Redeploy` للـ deployment الأخير
3. أو ادفع commit جديد إلى GitHub

### 4. 🧪 اختبار الـ API

بعد الـ deployment:
- Root: https://kasher-project.vercel.app/
- Health: https://kasher-project.vercel.app/api/health
- Auth: https://kasher-project.vercel.app/api/auth/
- Admin: https://kasher-project.vercel.app/api/admin/

### 5. 🔍 حل المشاكل الشائعة

#### مشكلة: 404 NOT_FOUND
- تأكد من وجود `vercel.json`
- تأكد من أن `"src": "server.js"` يشير للملف الصحيح
- تأكد من أن الملف `server.js` موجود في root

#### مشكلة: 500 Internal Server Error
- تأكد من إعداد جميع Environment Variables
- تحقق من اتصال MongoDB
- راجع Logs في Vercel Dashboard

#### مشكلة: Timeout
- MongoDB connection string صحيح
- MongoDB Atlas يسمح بـ connections من أي IP (0.0.0.0/0)

### 6. 📋 Vercel Functions Limitations

- Max execution time: 10 seconds (Hobby plan)
- Max payload: 5MB
- Memory: 1024MB (Hobby plan)

### 7. 🔗 روابط مفيدة

- [Vercel Node.js Guide](https://vercel.com/docs/concepts/functions/serverless-functions)
- [Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Troubleshooting](https://vercel.com/docs/concepts/get-started/troubleshoot)

## تحديث الكود

إذا عدلت في الكود:
1. اعمل commit و push للـ GitHub
2. Vercel سيعمل auto-deploy
3. أو اذهب للـ dashboard واعمل manual redeploy

## 🎯 نصائح للنجاح

1. **استخدم MongoDB Atlas** - أفضل من المحلي
2. **تأكد من الـ CORS** - مهم للـ frontend
3. **فعل Logs** - للمراقبة
4. **استخدم Environment Variables** - لا تكتب secrets في الكود
