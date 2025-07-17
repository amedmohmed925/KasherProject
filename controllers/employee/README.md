# Employee Feature Endpoints

Base URL: `http://localhost:8080/api`

## Get Product by SKU
- **GET** `/products/sku/:sku`
- Description: Fetch product details by SKU for the employee's tenant.

## Create Invoice
- **POST** `/invoices`
- Body: `{ tenantId, customer: { name, phone }, items: [{ sku, quantity }] }`
- Description: Create an invoice, update product stock, and save invoice for the tenant.
