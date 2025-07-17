# Super Admin Feature Endpoints

Base URL: `http://localhost:8080/api`

## List Tenants
- **GET** `/tenants`
- Description: List all supermarkets (tenants).

## Get Tenant Details
- **GET** `/tenants/:tenantId`
- Description: View details of a specific supermarket (products, invoices).

## Create Admin
- **POST** `/users/admin`
- Body: `{ tenantId, name, email, password }`
- Description: Create a new admin for a tenant.

## Update Admin
- **PUT** `/users/admin/:id`
- Body: `{ ...fields to update }`
- Description: Update an admin user.

## Delete Admin
- **DELETE** `/users/admin/:id`
- Description: Delete an admin user.

## Global Report
- **GET** `/reports/global`
- Description: Generate global report across all tenants.
