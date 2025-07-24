const request = require('supertest');
const app = require('../../server');

describe('Admin Endpoints', () => {
  it('should add a new product', async () => {
    const res = await request(app)
      .post('/api/admin/products')
      .send({
        name: 'Test Product',
        price: 100,
        category: 'Test Category'
      })
      .set('Authorization', 'Bearer <admin_token>');
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('message', 'Product added successfully');
  });

  it('should update an existing product', async () => {
    const res = await request(app)
      .put('/api/admin/products/123')
      .send({
        name: 'Updated Product',
        price: 150
      })
      .set('Authorization', 'Bearer <admin_token>');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Product updated successfully');
  });

  it('should fetch all invoices', async () => {
    const res = await request(app)
      .get('/api/admin/invoices')
      .set('Authorization', 'Bearer <admin_token>');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);
  });

  it('should fetch company sales report', async () => {
    const res = await request(app)
      .get('/api/admin/report')
      .set('Authorization', 'Bearer <admin_token>');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('report');
  });

  it('should fetch company stats', async () => {
    const res = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', 'Bearer <admin_token>');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('stats');
  });
});
