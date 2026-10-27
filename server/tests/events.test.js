import request from 'supertest';
import app from '../src/app.js';
import { setupTestDB } from './setup.js';

setupTestDB();

describe('Events, Deadlines & Follow-ups Endpoints', () => {
  let tokenA;
  let tokenB;
  let appIdA;

  beforeEach(async () => {
    const resA = await request(app).post('/api/auth/register').send({
      name: 'User A',
      email: 'a@example.com',
      password: 'Password123!',
    });
    tokenA = resA.body.token;

    const resB = await request(app).post('/api/auth/register').send({
      name: 'User B',
      email: 'b@example.com',
      password: 'Password123!',
    });
    tokenB = resB.body.token;

    const appRes = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        company: 'Airbnb',
        jobTitle: 'Backend Developer',
      });
    appIdA = appRes.body.data._id;
  });

  it('should create an event successfully linked to application', async () => {
    const eventDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString();
    const res = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        applicationId: appIdA,
        eventType: 'interview',
        title: 'System Design Round',
        dateTime: eventDate,
        locationOrLink: 'https://zoom.us/j/123456',
        notes: 'Prepare distributed caching and load balancing concepts',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('System Design Round');
    expect(res.body.data.isCompleted).toBe(false);
    expect(res.body.data.application.company).toBe('Airbnb');
  });

  it('should prevent User B from attaching event to User A application', async () => {
    const res = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${tokenB}`)
      .send({
        applicationId: appIdA,
        eventType: 'deadline',
        title: 'Application Deadline',
        dateTime: new Date().toISOString(),
      });

    expect(res.status).toBe(404);
  });

  it('should toggle event completion state', async () => {
    const createRes = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        applicationId: appIdA,
        eventType: 'follow-up',
        title: 'Follow up with recruiter via LinkedIn',
        dateTime: new Date().toISOString(),
      });
    const eventId = createRes.body.data._id;

    // Toggle complete
    const toggleRes1 = await request(app)
      .patch(`/api/events/${eventId}/toggle`)
      .set('Authorization', `Bearer ${tokenA}`);

    expect(toggleRes1.status).toBe(200);
    expect(toggleRes1.body.data.isCompleted).toBe(true);
    expect(toggleRes1.body.data.completedAt).not.toBeNull();

    // Toggle incomplete
    const toggleRes2 = await request(app)
      .patch(`/api/events/${eventId}/toggle`)
      .set('Authorization', `Bearer ${tokenA}`);

    expect(toggleRes2.status).toBe(200);
    expect(toggleRes2.body.data.isCompleted).toBe(false);
    expect(toggleRes2.body.data.completedAt).toBeNull();
  });
});
