
# Super Admin Feature Endpoints

Base URL: `http://localhost:8080/api`

---

## 1. List Tenants
- **GET** `/super-admin/tenants`
- **Auth:** Requires `Authorization: Bearer <superAdmin_token>`
- **Description:** List all tenants (supermarkets/companies).
- **Response:** Array of tenant objects.

---

## 2. Get Tenant Details
- **GET** `/super-admin/tenants/:tenantId`
- **Auth:** Requires `Authorization: Bearer <superAdmin_token>`
- **Description:** View details of a specific tenant (products, invoices, company info).
- **Response:** `{ tenant, products, invoices }`

---

## 3. Create Admin
- **POST** `/super-admin/users/admin`
- **Auth:** Requires `Authorization: Bearer <superAdmin_token>`
- **Body:**
  ```json
  { "tenantId": "string", "name": "string", "email": "string", "password": "string" }
  ```
- **Description:** Create a new admin for a tenant (company).
- **Response:** Admin user object (JSON).

---

## 4. Update Admin
- **PUT** `/super-admin/users/admin/:id`
- **Auth:** Requires `Authorization: Bearer <superAdmin_token>`
- **Body:** `{ ...fields to update }`
- **Description:** Update an admin user.
- **Response:** Updated admin user object.

---

## 5. Delete Admin
- **DELETE** `/super-admin/users/admin/:id`
- **Auth:** Requires `Authorization: Bearer <superAdmin_token>`
- **Description:** Delete an admin user.
- **Response:** `{ "message": "Admin deleted" }`

---

## 6. Get Super Admin Stats
- **GET** `/super-admin/stats`
- **Auth:** Requires `Authorization: Bearer <superAdmin_token>`
- **Description:**
  - Returns:
    - tenantsCount: عدد الشركات
    - usersCount: عدد المستخدمين
    - profits: أرباح كل شركة
    - products: قائمة المنتجات (الاسم، sku، السعر الأصلي، سعر البيع، tenantId)
- **Response:**
  ```json
  {
    "tenantsCount": 5,
    "usersCount": 20,
    "profits": [ { "_id": "tenantId", "total": 1234 }, ... ],
    "products": [ { "name": "...", "sku": "...", "originalPrice": 10, "sellingPrice": 15, "tenantId": "..." }, ... ]
  }
  ```

---

## 7. Global Report
- **GET** `/super-admin/reports/global`
- **Auth:** Requires `Authorization: Bearer <superAdmin_token>`
- **Description:** Generate a global report across all tenants (total sales, total invoices, top products sold).
- **Response:**
  ```json
  [
    {
      "_id": null,
      "totalSales": 10000,
      "totalInvoices": 50,
      "topProducts": [
        { "productId": "...", "name": "...", "quantitySold": 20 },
        ...
      ]
    }
  ]
  ```

---

## ملاحظات هامة
- جميع هذه الروابط تتطلب صلاحية superAdmin فقط.
- يجب تمرير التوكن في الهيدر: `Authorization: Bearer <token>`
- جميع الردود في حال الخطأ ترجع رسالة واضحة (`message`).
