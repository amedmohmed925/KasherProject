# Dashboard Endpoints

Base URL: `http://localhost:8080/api/admin/dashboard`

## 1. Analytics
**GET** `/analytics`
- **Query Parameters (اختياري):**
  - `startDate` (String): تاريخ البداية (ISO format).
  - `endDate` (String): تاريخ النهاية (ISO format).
- **Description:**
  - يعرض تحليلات لوحة التحكم بما في ذلك:
    - حالة المخزون (إجمالي الكمية والقيمة الإجمالية).
    - ملخصات الفواتير (عدد الفواتير والإيرادات الإجمالية).
  - يدعم التصفية حسب التاريخ باستخدام `startDate` و`endDate`.
- **Response Example:**
  ```json
  {
    "inventoryStatus": {
      "totalQuantity": 500,
      "totalValue": 25000
    },
    "invoiceSummaries": {
      "totalInvoices": 120,
      "totalRevenue": 50000
    }
  }
  ```

---

## ملاحظات هامة
- جميع الردود في حال الخطأ ترجع رسالة واضحة (`message`).
- يجب أن يكون المستخدم مصدقًا (Authenticated) وله صلاحيات الأدمن (Admin).
