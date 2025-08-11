# 📊 تحليلات لوحة التحكم الشاملة

## الـ Endpoint الجديد
```http
GET /api/admin/analytics/dashboard
```

## ما يوفره هذا الـ endpoint:

### 📈 الإحصائيات الأساسية
1. **إجمالي عدد الطلبات** (`totalOrders`)
2. **إجمالي الإيرادات** (`totalRevenue`) - مجموع جميع الفواتير
3. **متوسط سعر الطلب** (`averageOrderValue`) - الإيراد ÷ عدد الطلبات
4. **إجمالي الأرباح** (`totalProfit`) - (سعر البيع - سعر الشراء) × الكمية
5. **إجمالي المصروفات** (`totalExpensesFromSales`) - تكلفة البضاعة المباعة
6. **قيمة المخزون الكامل** (`totalInventoryValue`) - تكلفة جميع المنتجات الموجودة

### 📊 التحليلات المتقدمة
- **هامش الربح** (`profitMargin`) - نسبة الربح من الإيراد
- **متوسط القطع لكل طلب** (`averageItemsPerOrder`)
- **نسبة الخصومات** (`discountPercentage`)
- **إحصائيات المخزون** (عدد المنتجات والقطع)

### 🏆 أعلى الفواتير سعراً
- قائمة بأعلى 10 فواتير
- تفاصيل كاملة لكل فاتورة
- معلومات العميل والمنتجات

## أمثلة الاستخدام:

### جميع البيانات
```bash
curl "http://localhost:3000/api/admin/analytics/dashboard?period=all"
```

### بيانات هذا الشهر
```bash
curl "http://localhost:3000/api/admin/analytics/dashboard?period=month"
```

### فترة مخصصة
```bash
curl "http://localhost:3000/api/admin/analytics/dashboard?period=custom&startDate=2024-01-01&endDate=2024-12-31"
```

## الفائدة للتطبيق:
هذا الـ endpoint مصمم خصيصاً لصفحة التحليلات في التطبيق ويوفر جميع الأرقام والإحصائيات اللازمة في استدعاء واحد فقط.
