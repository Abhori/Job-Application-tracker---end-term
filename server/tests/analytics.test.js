import request from 'supertest';
import app from '../src/app.js';
import { setupTestDB } from './setup.js';

setupTestDB();

describe('Analytics Calculations & Metrics', () => {
  let token;

  beforeEach(async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Analytics User',
      email: 'analytics@example.com',
      password: 'Password123!',
    });
    token = res.body.token;
  });

  it('should return safe zeroed metrics on empty dataset without NaN or Infinity', async () => {
    const res = await request(app)
      .get('/api/analytics')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalApplications).toBe(0);
    expect(res.body.data.totalActive).toBe(0);
    expect(res.body.data.totalSubmitted).toBe(0);
    expect(res.body.data.interviewConversionRate).toBe(0);
    expect(res.body.data.offerConversionRate).toBe(0);
    expect(Number.isNaN(res.body.data.interviewConversionRate)).toBe(false);
    expect(Number.isFinite(res.body.data.interviewConversionRate)).toBe(true);
    expect(res.body.data.applicationsOverTime).toEqual([]);
    expect(res.body.data.definitions).toBeDefined();
  });

  it('should calculate accurate metrics and conversion rates based on real application history', async () => {
    // 1. Saved only (not submitted)
    await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${token}`)
      .send({
        company: 'Company 1',
        jobTitle: 'Role 1',
        status: 'SAVED',
      });

    // 2. Applied (submitted)
    await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${token}`)
      .send({
        company: 'Company 2',
        jobTitle: 'Role 2',
        status: 'APPLIED',
      });

    // 3. Interview reached (submitted + interview)
    const app3 = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${token}`)
      .send({
        company: 'Company 3',
        jobTitle: 'Role 3',
        status: 'APPLIED',
      });
    await request(app)
      .patch(`/api/applications/${app3.body.data._id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'INTERVIEW' });

    // 4. Offer reached (submitted + interview + offer)
    const app4 = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${token}`)
      .send({
        company: 'Company 4',
        jobTitle: 'Role 4',
        status: 'APPLIED',
      });
    await request(app)
      .patch(`/api/applications/${app4.body.data._id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'OFFER' });

    const analyticsRes = await request(app)
      .get('/api/analytics')
      .set('Authorization', `Bearer ${token}`);

    expect(analyticsRes.status).toBe(200);
    const data = analyticsRes.body.data;

    expect(data.totalApplications).toBe(4);
    // Submitted = Company 2, Company 3, Company 4 = 3
    expect(data.totalSubmitted).toBe(3);
    // Offers = Company 4 = 1
    expect(data.offersCount).toBe(1);

    // Reached Interview = Company 3, Company 4 = 2 out of 3 submitted => 66.7%
    expect(data.interviewConversionRate).toBe(66.7);

    // Reached Offer = Company 4 = 1 out of 3 submitted => 33.3%
    expect(data.offerConversionRate).toBe(33.3);
  });
});
