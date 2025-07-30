require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const { logRequests } = require('./middleware/logger');
const rateLimit = require('express-rate-limit');
const xss = require('xss-clean');
const helmet = require('helmet');
const csrf = require('csurf');

const adminRoutes = require('./routes/admin');
const superAdminRoutes = require('./routes/superAdmin');
const authRoutes = require('./routes/auth');
const invoicesRoutes = require('./routes/invoices');
const subscriptionsRoutes = require('./routes/subscriptions');
const inventoryRoutes = require('./routes/inventory');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(logRequests);
app.use(xss());
app.use(helmet());


const checkSubscription = require('./middleware/checkSubscription');

// Middleware عام لفحص المسارات المفتوحة 
app.use((req, res, next) => {
  const openPaths = [
    '/api/auth',
    '/api/superAdmin'  // السوبر أدمن لا يحتاج subscription check
  ];
  
  // المسارات المفتوحة تمر مباشرة
  if (openPaths.some(path => req.path.startsWith(path))) {
    return next();
  }
  
  // باقي المسارات ستتم معالجتها في الـ routes نفسها
  next();
});

// CSRF Protection Middleware
// const csrfProtection = csrf({
//   cookie: true,
// });
// app.use(csrfProtection);

// Rate Limiting Middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Custom Rate Limiting Middleware with Exceptions
app.use((req, res, next) => {
  // استثناء المسارات الخاصة بالمنتجات والسوبر أدمن
  if (
    req.path.startsWith('/api/admin/products') ||
    req.path.startsWith('/api/superAdmin')
  ) {
    return next();
  }
  limiter(req, res, next);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/superAdmin', superAdminRoutes);
app.use('/api/admin/invoices', invoicesRoutes);
app.use('/api/subscriptions', subscriptionsRoutes);
app.use('/api/inventory', inventoryRoutes);


// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'success',
    message: 'API is working perfectly! 🚀',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'مرحباً بك في نظام إدارة المتاجر - Kasher Project',
    status: 'API is running successfully',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      admin: '/api/admin', 
      superAdmin: '/api/superAdmin',
      subscriptions: '/api/subscriptions',
      inventory: '/api/inventory'
    },
    timestamp: new Date().toISOString(),
    server: 'Node.js + Express',
    database: 'MongoDB'
  });
});

// 404 Handler - يجب أن يكون قبل Error handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    requestedPath: req.originalUrl,
    method: req.method,
    availableEndpoints: {
      root: '/',
      health: '/api/health',
      auth: '/api/auth/*',
      admin: '/api/admin/*',
      superAdmin: '/api/superAdmin/*',
      subscriptions: '/api/subscriptions/*',
      inventory: '/api/inventory/*'
    },
    timestamp: new Date().toISOString()
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    success: false,
    message: err.message || 'Internal Server Error',
    timestamp: new Date().toISOString()
  });
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 3000;

console.log('🚀 Starting Kasher Project API...');
console.log('📡 Connecting to MongoDB...');

mongoose.connect(process.env.MONGO_URI, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
  socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
})
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    console.log('🎉 Server ready for requests');
    console.log(`🌐 Health Check: /api/health`);
    console.log('💡 Ready to accept requests!');
    
    // Only start server in non-serverless environments
    if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
      app.listen(PORT, () => {
        console.log(`🎉 Server running on port ${PORT}`);
        console.log(`🌐 API Base URL: http://localhost:${PORT}`);
        console.log(`❤️  Health Check: http://localhost:${PORT}/api/health`);
        console.log('📋 Available endpoints:');
        console.log('   - Root: /');
        console.log('   - Health: /api/health');
        console.log('   - Auth: /api/auth/*');
        console.log('   - Admin: /api/admin/*');
        console.log('   - Super Admin: /api/superAdmin/*');
        console.log('   - Subscriptions: /api/subscriptions/*');
        console.log('   - Inventory: /api/inventory/*');
        console.log('💡 Ready to accept requests!');
      });
    }
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    console.error('🔍 Please check your MONGO_URI in Vercel environment variables');
    // Don't exit in serverless environment, let it continue
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  });

// Export for Vercel
module.exports = app;
