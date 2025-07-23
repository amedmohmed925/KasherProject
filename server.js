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

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(logRequests);
app.use(xss());
app.use(helmet());

// CSRF Protection Middleware
const csrfProtection = csrf({
  cookie: true,
});
app.use(csrfProtection);

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

// Error handler
app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message || 'Internal Server Error' });
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 3000;
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });
