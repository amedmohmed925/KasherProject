const request = require('supertest');
const app = require('../../server');

describe('Subscriptions Endpoints', () => {
  it('should approve a subscription', async () => {
    const res = await request(app)
      .post('/api/super-admin/subscriptions/approve')
      .send({
        subscriptionId: '123',
        status: 'approved'
      })
      .set('Authorization', 'Bearer <super_admin_token>');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Subscription approved successfully');
  });

  it('should reject a subscription with a reason', async () => {
    const res = await request(app)
      .post('/api/super-admin/subscriptions/approve')
      .send({
        subscriptionId: '123',
        status: 'rejected',
        rejectionReason: 'Invalid payment details'
      })
      .set('Authorization', 'Bearer <super_admin_token>');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Subscription rejected successfully');
  });

  it('should upload a payment receipt', async () => {
    const res = await request(app)
      .post('/api/super-admin/subscriptions/upload-receipt')
      .attach('receipt', 'path/to/receipt.jpg')
      .set('Authorization', 'Bearer <super_admin_token>');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Receipt uploaded successfully');
  });

  it('should fetch subscription status', async () => {
    const res = await request(app)
      .get('/api/subscriptions/status')
      .set('Authorization', 'Bearer <user_token>');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status');
  });
});
