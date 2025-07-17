I need a complete Node.js backend application for a multi-tenant cashier system designed for supermarkets, with the following requirements:

### Project Overview
The application is a cashier system for multiple supermarkets, where each supermarket (tenant) has its own isolated data (products, invoices, reports). The system supports three user roles:
1. **Employee**: Works in a supermarket, creates invoices by manually entering product SKUs, and adds customer details.
2. **Admin**: Manages a single supermarket, adds/edits/deletes products (including manually entering SKUs), views invoices, and generates daily/monthly/yearly reports.
3. **Super Admin**: Owns the application, has full access to all supermarkets' data (products, invoices, reports), and can manage admins.

The application is intended for desktop use, so no barcode scanning is required. SKUs are manually entered as unique strings (e.g., "PROD123") by the admin.

### Technical Requirements
- **Framework**: Node.js with Express.js for RESTful APIs.
- **Database**: MongoDB with Mongoose for schema management.
- **Authentication**: Use JWT (JSON Web Tokens) for user authentication and role-based authorization.
- **Environment**: Use `dotenv` for environment variables (e.g., MongoDB URI, JWT secret).
- **Security**: Passwords should be hashed using `bcryptjs`. Ensure APIs are protected against unauthorized access.
- **Multi-tenancy**: Isolate each supermarket's data using a `tenantId` field in the database.

### Database Schema
Design the MongoDB schema with the following collections:
1. **Tenants**:
   - `_id`: ObjectId
   - `name`: String (supermarket name)
   - `address`: String
   - `createdAt`: Date
   - `adminId`: ObjectId (references the admin user)
2. **Users**:
   - `_id`: ObjectId
   - `tenantId`: ObjectId (null for superAdmin)
   - `name`: String
   - `email`: String (unique)
   - `password`: String (hashed)
   - `role`: String ("employee", "admin", "superAdmin")
   - `createdAt`: Date
3. **Products**:
   - `_id`: ObjectId
   - `tenantId`: ObjectId
   - `name`: String
   - `sku`: String (manually entered, unique within tenantId)
   - `originalPrice`: Number
   - `sellingPrice`: Number
   - `quantity`: Number
   - `category`: String (optional)
   - `description`: String (optional)
   - `image`: String (optional, URL)
   - `createdAt`: Date
   - `updatedAt`: Date
4. **Invoices**:
   - `_id`: ObjectId
   - `tenantId`: ObjectId
   - `invoiceNumber`: String (unique within tenantId, e.g., "INV-123")
   - `employeeId`: ObjectId
   - `customer`: { name: String, phone: String (optional) }
   - `items`: [{ productId: ObjectId, sku: String, name: String, quantity: Number, price: Number, total: Number }]
   - `totalAmount`: Number
   - `createdAt`: Date
5. **Reports** (optional, can be generated dynamically):
   - `_id`: ObjectId
   - `tenantId`: ObjectId
   - `type`: String ("daily", "monthly", "yearly")
   - `period`: String (e.g., "2025-07")
   - `totalSales`: Number
   - `totalInvoices`: Number
   - `topProducts`: [{ productId: ObjectId, name: String, quantitySold: Number }]
   - `createdAt`: Date

### API Endpoints
Implement the following RESTful APIs with proper authentication and authorization:

#### Employee Endpoints
1. **GET /api/products/sku/:sku**
   - Description: Fetch product details by manually entered SKU.
   - Authorization: Employee role, must belong to the tenant.
   - Response: Product details (name, sellingPrice, quantity).
2. **POST /api/invoices**
   - Description: Create an invoice with manually entered SKUs and quantities.
   - Body: { tenantId, customer: { name, phone }, items: [{ sku, quantity }] }
   - Logic:
     - Verify employee role and tenantId.
     - Check if products exist and have sufficient stock.
     - Calculate total amount (quantity * sellingPrice).
     - Update product quantities in the database.
     - Save the invoice with a unique invoiceNumber.
   - Response: Created invoice details.

#### Admin Endpoints
1. **POST /api/products**
   - Description: Add a new product with a manually entered SKU.
   - Body: { tenantId, name, sku, originalPrice, sellingPrice, quantity, category, description, image }
   - Logic:
     - Verify admin role and tenantId.
     - Ensure SKU is unique within tenantId.
     - Save the product.
   - Response: Created product details.
2. **PUT /api/products/:id**
   - Description: Update product details.
   - Logic: Verify admin role, update specified fields.
3. **DELETE /api/products/:id**
   - Description: Delete a product.
   - Logic: Verify admin role, ensure product is not used in invoices.
4. **GET /api/invoices**
   - Description: List invoices for the admin's tenant.
   - Query: page, limit, date (for filtering).
   - Response: Paginated list of invoices.
5. **GET /api/reports**
   - Description: Generate daily/monthly/yearly reports.
   - Query: type ("daily", "monthly", "yearly"), startDate, endDate.
   - Logic: Use MongoDB aggregation to calculate total sales, invoice count, and top products.
   - Response: Report data.

#### Super Admin Endpoints
1. **GET /api/tenants**
   - Description: List all supermarkets.
   - Authorization: Super admin role only.
   - Response: List of tenants.
2. **GET /api/tenants/:tenantId**
   - Description: View details of a specific supermarket (products, invoices, reports).
   - Response: Tenant details.
3. **POST /api/users/admin**
   - Description: Create a new admin for a tenant.
   - Body: { tenantId, name, email, password }
   - Logic: Verify super admin role, create user with role "admin".
4. **PUT /api/users/admin/:id**, **DELETE /api/users/admin/:id**
   - Description: Update or delete an admin.
5. **GET /api/reports/global**
   - Description: Generate global reports across all tenants.
   - Logic: Aggregate data from all tenants.

### Additional Requirements
- **Error Handling**: Handle cases like insufficient stock, invalid SKU, unauthorized access, etc.
- **Input Validation**: Use a library like `express-validator` to validate API inputs.
- **Logging**: Log API requests and errors using a library like `winston`.
- **Code Structure**:
  - Organize the project with separate folders: `models`, `routes`, `middleware`, `controllers`.
  - Use Mongoose models for MongoDB interactions.
  - Implement middleware for JWT authentication and role-based authorization.
- **Environment Variables**:
  - `MONGO_URI`: MongoDB connection string.
  - `JWT_SECRET`: Secret key for JWT.
  - `PORT`: Server port (default 3000).
- **Security**:
  - Hash passwords with `bcryptjs`.
  - Use HTTPS for API communication.
  - Protect against common vulnerabilities (e.g., SQL injection is not applicable, but ensure input sanitization).

### Example Workflow
1. **Employee**:
   - Logs in, enters an SKU manually (e.g., "PROD123") to fetch product details.
   - Adds multiple products with quantities to an invoice.
   - Optionally enters customer details (name, phone).
   - Submits the invoice, which updates the product stock and saves the invoice.
2. **Admin**:
   - Logs in, adds a product with a unique SKU (e.g., "PROD123").
   - Views invoices and generates reports for their supermarket.
3. **Super Admin**:
   - Logs in, views all supermarkets, their products, invoices, and reports.
   - Manages admins for each supermarket.

### Deliverables
- A complete Node.js backend project with:
  - `server.js`: Main entry point with Express setup and MongoDB connection.
  - `models/`: Mongoose schemas for Tenants, Users, Products, Invoices, Reports.
  - `routes/`: Separate route files for employee, admin, and super admin endpoints.
  - `middleware/auth.js`: JWT authentication and role-based authorization.
  - `controllers/`: Logic for each endpoint (e.g., createInvoice, addProduct).
  - `.env`: Example environment file.
- Ensure the code is modular, well-commented, and follows Node.js best practices.

Please generate the complete backend code structure, including all necessary files, with proper error handling and security measures. If you need clarification on any part, let me know!