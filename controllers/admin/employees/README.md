# Employee Management Endpoints (Admin)

Base URL: `http://localhost:8080/api/admin/employees`

## Get All Employees
- **GET** `/`
- Description: Get all employees for the admin's company.
- Response Example:
  ```json
  [
    { "_id": "...", "name": "أحمد محمد", "email": "ahmed@example.com", "tenantId": "...", "role": "employee" },
    { "_id": "...", "name": "سارة علي", "email": "sara@example.com", "tenantId": "...", "role": "employee" }
  ]
  ```

## Delete Employee
- **DELETE** `/:id`
- Description: Delete an employee by their ID from the admin's company.
- Response Example:
  ```json
  { "message": "Employee deleted" }
  ```

---

- جميع المسارات تتطلب توثيق الأدمن (JWT) في الهيدر.
- جميع العمليات تتم في نطاق الشركة الخاصة بالأدمن فقط.
