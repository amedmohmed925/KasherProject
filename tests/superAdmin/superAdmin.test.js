const request = require('supertest');
const app = require('../../server');

describe('Super Admin Endpoints', () => {
  it('should fetch all tenants', async () => {
    const res = await request(app)
      .get('/api/super-admin/tenants')
      .set('Authorization', 'Bearer <super_admin_token>');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);
  });

  it('should fetch tenant details', async () => {
    const res = await request(app)
      .get('/api/super-admin/tenants/123')
      .set('Authorization', 'Bearer <super_admin_token>');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('tenant');
  });

  it('should add a new admin to a tenant', async () => {
    const res = await request(app)
      .post('/api/super-admin/users/admin')
      .send({
        tenantId: '123',
        name: 'New Admin',
        email: 'newadmin@example.com',
        password: 'password123'
      })
      .set('Authorization', 'Bearer <super_admin_token>');
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('message', 'Admin added successfully');
  });

  it('should update an admin', async () => {
    const res = await request(app)
      .put('/api/super-admin/users/admin/456')
      .send({
        name: 'Updated Admin'
      })
      .set('Authorization', 'Bearer <super_admin_token>');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Admin updated successfully');
  });

  it('should delete an admin', async () => {
    const res = await request(app)
      .delete('/api/super-admin/users/admin/456')
      .set('Authorization', 'Bearer <super_admin_token>');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Admin deleted successfully');
  });

  it('should disable a tenant', async () => {
    const res = await request(app)
      .patch('/api/super-admin/tenants/123/disable')
      .set('Authorization', 'Bearer <super_admin_token>');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Tenant disabled successfully');
  });

  it('should delete a tenant', async () => {
    const res = await request(app)
      .delete('/api/super-admin/tenants/123')
      .set('Authorization', 'Bearer <super_admin_token>');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Tenant deleted successfully');
  });

  it('should fetch global stats', async () => {
    const res = await request(app)
      .get('/api/super-admin/stats')
      .set('Authorization', 'Bearer <super_admin_token>');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('stats');
  });

  it('should fetch global report', async () => {
    const res = await request(app)
      .get('/api/super-admin/reports/global')
      .set('Authorization', 'Bearer <super_admin_token>');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('report');
  });
});
