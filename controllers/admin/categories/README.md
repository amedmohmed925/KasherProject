# Category Endpoints (Admin)

Base URL: `http://localhost:8080/api/admin/categories`

## Get All Categories
- **GET** `/`
- Description: Get all categories for the admin's company.
- Response Example:
  ```json
  [
    { "_id": "...", "name": "أجبان", "tenantId": "...", "createdAt": "..." },
    { "_id": "...", "name": "مشروبات", "tenantId": "...", "createdAt": "..." }
  ]
  ```

## Add Category
- **POST** `/`
- Body Example:
  ```json
  { "name": "أجبان" }
  ```
- Description: Add a new category for the admin's company.
- Response Example:
  ```json
  { "message": "Category created", "category": { "_id": "...", "name": "أجبان", "tenantId": "...", "createdAt": "..." } }
  ```

## Update Category
- **PUT** `/:id`
- Body Example:
  ```json
  { "name": "مشروبات" }
  ```
- Description: Update the name of a category by its ID.
- Response Example:
  ```json
  { "message": "Category updated", "category": { "_id": "...", "name": "مشروبات", "tenantId": "...", "createdAt": "..." } }
  ```

## Delete Category
- **DELETE** `/:id`
- Description: Delete a category by its ID.
- Response Example:
  ```json
  { "message": "Category deleted" }
  ```

---

- جميع المسارات تتطلب توثيق الأدمن (JWT) في الهيدر.
- جميع العمليات تتم في نطاق الشركة الخاصة بالأدمن فقط.
