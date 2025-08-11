// Simple test to check if controller loads properly
const getCustomersController = require('./controllers/admin/customers/getCustomersController');

console.log('getCustomersController type:', typeof getCustomersController);
console.log('getCustomersController:', getCustomersController);

if (typeof getCustomersController === 'function') {
  console.log('✅ Controller is a function');
} else {
  console.log('❌ Controller is not a function');
}
