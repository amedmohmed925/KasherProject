
# Employee Feature Endpoints

Base URL: `http://localhost:8080/api`

## Get Product by SKU
- **GET** `/products/sku/:sku`
- Description: Fetch product details by SKU for the employee's tenant.
- Response Example:
  ```json
  {
    "name": "جبنة بيضاء",
    "sellingPrice": 50,
    "quantity": 100
  }
  ```

## Create Invoice
- **POST** `/invoices`
- Body Example:
  ```json
  {
    "tenantId": "<tenantId>",
    "customer": { "name": "أحمد محمد", "phone": "01000000000" },
    "items": [
      { "sku": "SKU123", "quantity": 2 },
      { "sku": "SKU456", "quantity": 1 }
    ]
  }
  ```
- Description: Create an invoice, update product stock, and save invoice for the tenant.
- Response Example:
  ```json
  {
    "_id": "...",
    "tenantId": "...",
    "invoiceNumber": "INV-1",
    "employeeId": "...",
    "customer": { "name": "أحمد محمد", "phone": "01000000000" },
    "items": [
      {
        "productId": "...",
        "sku": "SKU123",
        "name": "جبنة بيضاء",
        "quantity": 2,
        "price": 50,
        "total": 100
      },
      {
        "productId": "...",
        "sku": "SKU456",
        "name": "زبدة",
        "quantity": 1,
        "price": 30,
        "total": 30
      }
    ],
    "totalAmount": 130,
    "createdAt": "..."
  }
  ```
- Notes:
  - Each item must have a valid SKU and available stock.
  - The invoice will not be created if any product is not found or stock is insufficient.
