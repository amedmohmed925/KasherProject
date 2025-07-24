const request = require('supertest');
const app = require('../../server').app; // تعديل لاستيراد التطبيق فقط بدون تشغيل الخادم
const mongoose = require('mongoose');

process.env.NODE_ENV = 'test';
process.env.PORT = 8080;

beforeAll(async () => {
  const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/testdb';
  await mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
  // إضافة تأخير للتأكد من أن قاعدة البيانات جاهزة
  await new Promise(resolve => setTimeout(resolve, 2000));
  console.log('MongoDB connected for testing');
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Auth Endpoints', () => {
  it('should register a new admin and create a company', async () => {
    const res = await request(app)
      .post('/api/register')
      .send({
        firstName: 'Test',
        lastName: 'Admin',
        businessName: 'Test Company',
        phone: '1234567890',
        email: 'testadmin@example.com',
        password: 'password123',
        confirmPassword: 'password123'
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('message', 'تم التسجيل بنجاح. يرجى التحقق من بريدك الإلكتروني.');
  });
});
