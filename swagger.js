const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Kasher Project API',
      version: '1.0.0',
      description: 'نظام إدارة المتاجر - Multi-tenant Cashier System API Documentation',
      contact: {
        name: 'Kasher Project Support',
        email: 'support@kasherproject.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Development server'
      },
      {
        url: 'https://your-domain.vercel.app/api',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Authorization header using the Bearer scheme'
        }
      },
      schemas: {
        // User Schemas
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            firstName: { type: 'string', example: 'أحمد' },
            lastName: { type: 'string', example: 'محمد' },
            email: { type: 'string', format: 'email', example: 'admin@example.com' },
            companyName: { type: 'string', example: 'شركة الكاشير' },
            companyAddress: { type: 'string', example: 'القاهرة، مصر' },
            phone: { type: 'string', example: '+201234567890' },
            role: { type: 'string', enum: ['admin', 'superAdmin'], example: 'admin' },
            isVerified: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        
        // Product Schemas
        Product: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            adminId: { type: 'string', example: '507f1f77bcf86cd799439011' },
            name: { type: 'string', example: 'جبنة بيضاء' },
            sku: { type: 'string', example: 'SKU123' },
            originalPrice: { type: 'number', example: 40 },
            sellingPrice: { type: 'number', example: 50 },
            quantity: { type: 'integer', example: 100 },
            categoryId: { type: 'string', example: '507f1f77bcf86cd799439011' },
            description: { type: 'string', example: 'جبنة بيضاء طازجة' },
            image: { type: 'string', example: 'https://cloudinary.com/image.jpg' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        
        // Category Schema
        Category: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            adminId: { type: 'string', example: '507f1f77bcf86cd799439011' },
            name: { type: 'string', example: 'منتجات الألبان' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        
        // Invoice Schemas
        Invoice: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            adminId: { type: 'string', example: '507f1f77bcf86cd799439011' },
            invoiceNumber: { type: 'string', example: 'INV-1640995200000' },
            customer: {
              type: 'object',
              properties: {
                name: { type: 'string', example: 'أحمد محمد' },
                phone: { type: 'string', example: '+201234567890' }
              }
            },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  productId: { type: 'string', example: '507f1f77bcf86cd799439011' },
                  sku: { type: 'string', example: 'SKU123' },
                  name: { type: 'string', example: 'جبنة بيضاء' },
                  quantity: { type: 'integer', example: 2 },
                  price: { type: 'number', example: 50 },
                  total: { type: 'number', example: 100 }
                }
              }
            },
            totalAmount: { type: 'number', example: 100 },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        
        // Subscription Schema
        Subscription: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            adminId: { type: 'string', example: '507f1f77bcf86cd799439011' },
            plan: { type: 'string', enum: ['trial', 'monthly', 'yearly', 'custom'], example: 'monthly' },
            price: { type: 'number', example: 49 },
            startDate: { type: 'string', format: 'date-time' },
            endDate: { type: 'string', format: 'date-time' },
            status: { type: 'string', enum: ['pending', 'approved', 'rejected'], example: 'approved' },
            paymentConfirmed: { type: 'boolean', example: true },
            receiptImage: { type: 'string', example: 'https://cloudinary.com/receipt.jpg' },
            paidAmountText: { type: 'string', example: '49 جنيه مصري' },
            duration: { type: 'string', enum: ['trial', 'month', 'year', 'custom'], example: 'month' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        
        // Request/Response Schemas
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'admin@example.com' },
            password: { type: 'string', example: 'password123' }
          }
        },
        
        LoginResponse: {
          type: 'object',
          properties: {
            token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
            refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
            user: { $ref: '#/components/schemas/User' }
          }
        },
        
        RegisterRequest: {
          type: 'object',
          required: ['firstName', 'lastName', 'companyName', 'companyAddress', 'phone', 'email', 'password', 'confirmPassword'],
          properties: {
            firstName: { type: 'string', example: 'أحمد' },
            lastName: { type: 'string', example: 'محمد' },
            companyName: { type: 'string', example: 'شركة الكاشير' },
            companyAddress: { type: 'string', example: 'القاهرة، مصر' },
            phone: { type: 'string', example: '+201234567890' },
            email: { type: 'string', format: 'email', example: 'admin@example.com' },
            password: { type: 'string', minLength: 6, example: 'password123' },
            confirmPassword: { type: 'string', example: 'password123' }
          }
        },
        
        ProductRequest: {
          type: 'object',
          required: ['name', 'sku', 'originalPrice', 'sellingPrice', 'quantity', 'categoryId'],
          properties: {
            name: { type: 'string', example: 'جبنة بيضاء' },
            sku: { type: 'string', example: 'SKU123' },
            originalPrice: { type: 'number', example: 40 },
            sellingPrice: { type: 'number', example: 50 },
            quantity: { type: 'integer', minimum: 0, example: 100 },
            categoryId: { type: 'string', example: '507f1f77bcf86cd799439011' },
            description: { type: 'string', example: 'جبنة بيضاء طازجة' }
          }
        },
        
        InvoiceRequest: {
          type: 'object',
          required: ['products'],
          properties: {
            products: {
              type: 'array',
              items: {
                type: 'object',
                required: ['sku', 'quantity'],
                properties: {
                  sku: { type: 'string', example: 'SKU123' },
                  quantity: { type: 'integer', minimum: 1, example: 2 }
                }
              }
            },
            customerName: { type: 'string', example: 'أحمد محمد' }
          }
        },
        
        // Error Response
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Error message' },
            timestamp: { type: 'string', format: 'date-time' }
          }
        },
        
        // Success Response
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Operation completed successfully' },
            data: { type: 'object' }
          }
        },
        
        // Pagination
        Pagination: {
          type: 'object',
          properties: {
            currentPage: { type: 'integer', example: 1 },
            totalPages: { type: 'integer', example: 10 },
            totalItems: { type: 'integer', example: 100 },
            limit: { type: 'integer', example: 10 },
            hasNext: { type: 'boolean', example: true },
            hasPrev: { type: 'boolean', example: false }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./routes/*.js', './swagger-docs/*.yaml'] // paths to files containing OpenAPI definitions
};

const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };
