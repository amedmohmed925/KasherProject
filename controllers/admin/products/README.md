# Product Endpoints (Admin)

Base URL: `http://localhost:8080/api/admin/products`

## Get All Products
- **GET** `/`
- Description: Get all products for the admin's company.
- Response Example:
  ```json
  [
    { "_id": "...", "name": "جبنة بيضاء", "sku": "SKU123", "originalPrice": 40, "sellingPrice": 50, "quantity": 100, "categoryId": "...", "tenantId": "..." },
    { "_id": "...", "name": "زبدة", "sku": "SKU456", "originalPrice": 20, "sellingPrice": 30, "quantity": 50, "categoryId": "...", "tenantId": "..." }
  ]
  ```

## Add Product
- **POST** `/`
- Body Example:
  ```json
  { "name": "جبنة بيضاء", "sku": "SKU123", "originalPrice": 40, "sellingPrice": 50, "quantity": 100, "categoryId": "..." }
  ```
- Description: Add a new product for the admin's company. SKU must be unique within the company.
- Response Example:
  ```json
  { "message": "Product created", "product": { "_id": "...", "name": "جبنة بيضاء", "sku": "SKU123", "originalPrice": 40, "sellingPrice": 50, "quantity": 100, "categoryId": "...", "tenantId": "..." } }
  ```

## Update Product
- **PUT** `/:id`
- Body Example:
  ```json
  { "name": "زبدة", "sku": "SKU456", "originalPrice": 20, "sellingPrice": 30, "quantity": 50, "categoryId": "..." }
  ```
- Description: Update a product by its ID.
- Response Example:
  ```json
  { "message": "Product updated", "product": { "_id": "...", "name": "زبدة", "sku": "SKU456", "originalPrice": 20, "sellingPrice": 30, "quantity": 50, "categoryId": "...", "tenantId": "..." } }
  ```

## Delete Product
- **DELETE** `/:id`
- Description: Delete a product by its ID. Cannot delete if used in invoices.
- Response Example:
  ```json
  { "message": "Product deleted" }
  ```

---

- جميع المسارات تتطلب توثيق الأدمن (JWT) في الهيدر.
- جميع العمليات تتم في نطاق الشركة الخاصة بالأدمن فقط.
