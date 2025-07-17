# Admin Feature Endpoints

Base URL: `http://localhost:8080/api`

## Add Product
- **POST** `/products`
- Body: `{ tenantId, name, sku, originalPrice, sellingPrice, quantity, category, description, image }`
- Description: Add a new product (SKU must be unique per tenant).

## Update Product
- **PUT** `/products/:id`
- Body: `{ ...fields to update }`
- Description: Update product details by product ID.

## Delete Product
- **DELETE** `/products/:id`
- Description: Delete a product by ID (if not used in invoices).

## List Invoices
- **GET** `/invoices?limit=10&page=1&date=YYYY-MM-DD`
- Description: List invoices for the admin's tenant (with pagination and optional date filter).

## Generate Report
- **GET** `/reports?type=daily|monthly|yearly&startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`
- Description: Generate sales report for the tenant.
