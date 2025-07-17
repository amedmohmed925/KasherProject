# Admin Feature Endpoints

Base URL: `http://localhost:8080/api`

## Add Product

# Admin Feature Endpoints

Base URL: `http://localhost:8080/api/admin`


# Admin Documentation (Core Endpoints)

Base URL: `http://localhost:8080/api/admin`

---

## 1. Add Product
- **POST** `/products`
- Body Example:
  ```json
  { "name": "جبنة بيضاء", "sku": "SKU123", "originalPrice": 40, "sellingPrice": 50, "quantity": 100, "categoryId": "..." }
  ```
- Description: Add a new product (SKU must be unique within the company).
- Response: `{ message, product }`

## 2. Update Product
- **PUT** `/products/:id`
- Body Example:
  ```json
  { "name": "زبدة", "sku": "SKU456", "originalPrice": 20, "sellingPrice": 30, "quantity": 50, "categoryId": "..." }
  ```
- Description: Update product details by product ID.
- Response: `{ message, product }`

## 3. List Invoices
- **GET** `/invoices?limit=10&page=1&date=YYYY-MM-DD`
- Description: List invoices for the admin's company (pagination, optional date filter).
- Response: قائمة فواتير مع بياناتها.

## 4. Generate Report
- **GET** `/reports?type=daily|monthly|yearly&startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`
- Description: Generate sales report for the company (grouped by day/month/year, includes top products).
- Response Example:
  ```json
  [
    {
      "_id": "2025-07-17",
      "totalSales": 1000,
      "totalInvoices": 5,
      "topProducts": [
        { "productId": "...", "name": "جبنة بيضاء", "quantitySold": 10 },
        { "productId": "...", "name": "زبدة", "quantitySold": 5 }
      ]
    }
  ]
  ```

## 5. Admin Stats
- **GET** `/stats`
- Description: Get admin stats (employees count, invoices count, daily/monthly/yearly profits).
- Response Example:
  ```json
  {
    "employeesCount": 3,
    "invoicesCount": 20,
    "todayProfit": 500,
    "monthProfit": 12000,
    "yearProfit": 150000
  }
  ```

---

- جميع المسارات تتطلب توثيق الأدمن (JWT) في الهيدر.
- جميع العمليات تتم في نطاق الشركة الخاصة بالأدمن فقط.
