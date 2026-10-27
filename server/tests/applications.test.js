import request from 'supertest';
import app from '../src/app.js';
import { setupTestDB } from './setup.js';
import { Application } from '../src/models/Application.js';
import { Event } from '../src/models/Event.js';

setupTestDB();

describe('Application Lifecycle & Ownership Endpoints', () => {
  let userTokenA;
  let userTokenB;

  beforeEach(async () => {
    // Register User A
    const resA = await request(app).post('/api/auth/register').send({
      name: 'User Alpha',
      email: 'alpha@example.com',
      password: 'Password123!',
    });
    userTokenA = resA.body.token;

    // Register User B
    const resB = await request(app).post('/api/auth/register').send({
      name: 'User Beta',
      email: 'beta@example.com',
      password: 'Password123!',
    });
    userTokenB = resB.body.token;
  });

  it('should create an application with default SAVED status and status history', async () => {
    const res = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${userTokenA}`)
      .send({
        company: 'Acme Corp',
        jobTitle: 'Frontend Engineer Intern',
        location: 'Remote',
        workMode: 'remote',
        employmentType: 'internship',
        notes: 'Applied through university portal',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.company).toBe('Acme Corp');
    expect(res.body.data.status).toBe('SAVED');
    expect(res.body.data.statusHistory).toHaveLength(1);
    expect(res.body.data.statusHistory[0].status).toBe('SAVED');
  });

  it('should warn on duplicate application and allow forceDuplicate override', async () => {
    // 1st application
    await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${userTokenA}`)
      .send({
        company: 'Stripe',
        jobTitle: 'Software Engineer',
      });

    // 2nd application with same company & title
    const duplicateRes = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${userTokenA}`)
      .send({
        company: 'Stripe',
        jobTitle: 'Software Engineer',
      });

    expect(duplicateRes.status).toBe(409);
    expect(duplicateRes.body.isDuplicate).toBe(true);

    // Deliberately force duplicate
    const forceRes = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${userTokenA}`)
      .send({
        company: 'Stripe',
        jobTitle: 'Software Engineer',
        forceDuplicate: true,
      });

    expect(forceRes.status).toBe(201);
    expect(forceRes.body.success).toBe(true);
  });

  it('should strictly enforce ownership: User B cannot view User A application', async () => {
    // User A creates application
    const createRes = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${userTokenA}`)
      .send({
        company: 'Google',
        jobTitle: 'STEP Intern',
      });
    const appId = createRes.body.data._id;

    // User B tries to view User A's application
    const viewRes = await request(app)
      .get(`/api/applications/${appId}`)
      .set('Authorization', `Bearer ${userTokenB}`);

    expect(viewRes.status).toBe(404);

    // User B tries to update User A's application
    const updateRes = await request(app)
      .put(`/api/applications/${appId}`)
      .set('Authorization', `Bearer ${userTokenB}`)
      .send({ company: 'Hacked Inc' });

    expect(updateRes.status).toBe(404);

    // User B tries to delete User A's application
    const deleteRes = await request(app)
      .delete(`/api/applications/${appId}`)
      .set('Authorization', `Bearer ${userTokenB}`);

    expect(deleteRes.status).toBe(404);
  });

  it('should update application status and append to status history', async () => {
    const createRes = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${userTokenA}`)
      .send({
        company: 'Microsoft',
        jobTitle: 'Software Engineer',
        status: 'SAVED',
      });
    const appId = createRes.body.data._id;

    const statusRes = await request(app)
      .patch(`/api/applications/${appId}/status`)
      .set('Authorization', `Bearer ${userTokenA}`)
      .send({
        status: 'INTERVIEW',
        note: 'Recruiter called for screening round',
      });

    expect(statusRes.status).toBe(200);
    expect(statusRes.body.data.status).toBe('INTERVIEW');
    expect(statusRes.body.data.statusHistory).toHaveLength(2);
    expect(statusRes.body.data.statusHistory[1].status).toBe('INTERVIEW');
    expect(statusRes.body.data.statusHistory[1].note).toBe('Recruiter called for screening round');
  });

  it('should delete application and its linked events', async () => {
    const createRes = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${userTokenA}`)
      .send({
        company: 'Netflix',
        jobTitle: 'Full Stack Engineer',
      });
    const appId = createRes.body.data._id;

    // Create an event for this app
    await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${userTokenA}`)
      .send({
        applicationId: appId,
        eventType: 'interview',
        title: 'Technical Screen',
        dateTime: new Date(Date.now() + 86400000).toISOString(),
      });

    // Delete application
    const deleteRes = await request(app)
      .delete(`/api/applications/${appId}`)
      .set('Authorization', `Bearer ${userTokenA}`);

    expect(deleteRes.status).toBe(200);

    // Verify application deleted
    const checkApp = await Application.findById(appId);
    expect(checkApp).toBeNull();

    // Verify event deleted
    const checkEvents = await Event.find({ application: appId });
    expect(checkEvents).toHaveLength(0);
  });

  it('should safely handle invalid ObjectId formats with 400 Bad Request', async () => {
    const res = await request(app)
      .get('/api/applications/invalid-not-an-id')
      .set('Authorization', `Bearer ${userTokenA}`);

    expect(res.status).toBe(400);
  });
});
