# Super Admin - Tenants Management Endpoints

Base URL: `http://localhost:8080/api`

---

## 1. Get All Tenants Stats
- **Endpoint:** `/super-admin/tenants/stats`
- **Method:** `GET`
- **Auth:** Requires `Authorization: Bearer <superAdmin_token>`
- **Description:**
  - Returns a list of all tenants (companies) with their invoices and total profit for each tenant.
- **Response Example:**
  ```json
  [
    {
      "tenantId": "...",
      "name": "...",
      "address": "...",
      "invoices": [ /* array of invoices */ ],
      "totalProfit": 12345
    },
    // ...
  ]
  ```
- **Errors:**
  - `403 Forbidden` — If user is not superAdmin
  - `500 Server error`

---

## 2. Disable Tenant
- **Endpoint:** `/super-admin/tenants/:tenantId/disable`
- **Method:** `PATCH`
- **Auth:** Requires `Authorization: Bearer <superAdmin_token>`
- **Description:**
  - Disables a tenant (company) by setting `disabled: true`.
- **Response Example:**
  ```json
  {
    "message": "Tenant disabled",
    "tenant": { /* updated tenant object */ }
  }
  ```
- **Errors:**
  - `403 Forbidden` — If user is not superAdmin
  - `404 Not Found` — If tenant does not exist
  - `500 Server error`

---

## 3. Delete Tenant
- **Endpoint:** `/super-admin/tenants/:tenantId`
- **Method:** `DELETE`
- **Auth:** Requires `Authorization: Bearer <superAdmin_token>`
- **Description:**
  - Deletes a tenant (company) and all its employees and invoices.
- **Response Example:**
  ```json
  { "message": "Tenant deleted" }
  ```
- **Errors:**
  - `403 Forbidden` — If user is not superAdmin
  - `500 Server error`

---

## Notes
- جميع هذه الروابط تتطلب صلاحية superAdmin فقط.
- يجب تمرير التوكن في الهيدر: `Authorization: Bearer <token>`
- هذه الروابط مخصصة لإدارة الشركات من لوحة تحكم السوبر أدمن.
