const request = require('supertest');
const app = require('../../server');

describe('Super Admin Endpoints', () => {
  it('should add a new admin', async () => {
    const res = await request(app)
      .post('/api/super-admin/users/admin')
      .send({
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
});
