# Invoice Endpoints (Admin)

Base URL: `http://localhost:8080/api/admin/invoices`

## Get All Invoices (Advanced Search)
- **GET** `/all-invoices`
- Query Params (اختياري):
  - `page` (رقم الصفحة)
  - `limit` (عدد النتائج في الصفحة)
  - `startDate`, `endDate` (تصفية بالتاريخ)
  - `customer` (بحث باسم العميل)
  - `employee` (بحث بمعرف الموظف)
  - `minTotal`, `maxTotal` (تصفية حسب إجمالي الفاتورة)
- Description: Get all invoices for the admin's company with advanced filtering and pagination.
- Response: قائمة فواتير مع بيانات الموظف.

## Get Invoice Profit (Original vs Selling Price)
- **GET** `/:id/profit`
- Description: Get the original total price, selling total price, and profit for a specific invoice.
- Response Example:
  ```json
  {
    "invoiceId": "...",
    "totalOriginal": 80,
    "totalSelling": 100,
    "profit": 20
  }
  ```

---

- جميع المسارات تتطلب توثيق الأدمن (JWT) في الهيدر.
- جميع العمليات تتم في نطاق الشركة الخاصة بالأدمن فقط.
