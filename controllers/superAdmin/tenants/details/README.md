# Super Admin - Get Tenant Details Endpoint

Base URL: `http://localhost:8080/api`

---

## Get Tenant Details

- **Endpoint:** `/super-admin/tenants/:tenantId/details`
- **Method:** `GET`
- **Auth:** Requires `Authorization: Bearer <superAdmin_token>`

### Description
- Returns details about a specific tenant (company), including:
  - Tenant info
  - List of employees (role: employee)
  - List of invoices for the tenant

### Request
- **URL Params:**
  - `tenantId` (string) — The ID of the tenant/company
- **Headers:**
  - `Authorization: Bearer <superAdmin_token>`

#### Example
```
GET /super-admin/tenants/64a1b2c3d4e5f6a7b8c9d0e1/details
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6...
```

### Response
- **Success (200):**
  ```json
  {
    "tenant": { /* tenant object */ },
    "employees": [ /* array of employee users */ ],
    "invoices": [ /* array of invoices */ ]
  }
  ```
- **Errors:**
  - `403 Forbidden` — If user is not superAdmin
  - `404 Not Found` — If tenant does not exist
  - `500 Server error` — On server error

### Notes
- Only accessible by users with role `superAdmin`.
- Used by frontend to display company profile, employees, and invoices in one request.
