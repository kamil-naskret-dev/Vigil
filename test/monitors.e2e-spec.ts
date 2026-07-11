import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './setup/create-app';
import { cleanDatabase, closeDatabase } from './setup/db-cleanup';

describe('Monitors (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let monitorId: string;

  beforeAll(async () => {
    app = await createTestApp();
    await cleanDatabase();

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'monitor-test@example.com', password: 'password123' });

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'monitor-test@example.com', password: 'password123' });

    accessToken = loginRes.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
    await closeDatabase();
  });

  const auth = () => ({ Authorization: `Bearer ${accessToken}` });

  describe('POST /monitors', () => {
    it('should create a monitor', async () => {
      const res = await request(app.getHttpServer())
        .post('/monitors')
        .set(auth())
        .send({
          name: 'Test Monitor',
          url: 'https://example.com',
          intervalMinutes: 5,
        })
        .expect(201);

      expect(res.body.id).toBeDefined();
      monitorId = res.body.id;
    });

    it('should return 400 for invalid URL', async () => {
      await request(app.getHttpServer())
        .post('/monitors')
        .set(auth())
        .send({ name: 'Bad Monitor', url: 'not-a-url', intervalMinutes: 5 })
        .expect(400);
    });

    it('should return 400 for invalid interval', async () => {
      await request(app.getHttpServer())
        .post('/monitors')
        .set(auth())
        .send({
          name: 'Bad Monitor',
          url: 'https://example.com',
          intervalMinutes: 7,
        })
        .expect(400);
    });

    it('should return 401 without token', async () => {
      await request(app.getHttpServer())
        .post('/monitors')
        .send({ name: 'Test', url: 'https://example.com', intervalMinutes: 5 })
        .expect(401);
    });
  });

  describe('GET /monitors', () => {
    it('should return list of monitors', async () => {
      const res = await request(app.getHttpServer())
        .get('/monitors')
        .set(auth())
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toMatchObject({
        id: monitorId,
        name: 'Test Monitor',
      });
    });
  });

  describe('GET /monitors/:id', () => {
    it('should return a single monitor', async () => {
      const res = await request(app.getHttpServer())
        .get(`/monitors/${monitorId}`)
        .set(auth())
        .expect(200);

      expect(res.body.id).toBe(monitorId);
      expect(res.body.status).toBe('ACTIVE');
    });

    it('should return 404 for non-existent monitor', async () => {
      await request(app.getHttpServer())
        .get('/monitors/non-existent-id')
        .set(auth())
        .expect(404);
    });
  });

  describe('PATCH /monitors/:id', () => {
    it('should update monitor name', async () => {
      await request(app.getHttpServer())
        .patch(`/monitors/${monitorId}`)
        .set(auth())
        .send({ name: 'Updated Monitor' })
        .expect(200);

      const res = await request(app.getHttpServer())
        .get(`/monitors/${monitorId}`)
        .set(auth());

      expect(res.body.name).toBe('Updated Monitor');
    });
  });

  describe('POST /monitors/:id/pause', () => {
    it('should pause an active monitor', async () => {
      await request(app.getHttpServer())
        .post(`/monitors/${monitorId}/pause`)
        .set(auth())
        .expect(204);

      const res = await request(app.getHttpServer())
        .get(`/monitors/${monitorId}`)
        .set(auth());

      expect(res.body.status).toBe('PAUSED');
    });

    it('should return 400 when already paused', async () => {
      await request(app.getHttpServer())
        .post(`/monitors/${monitorId}/pause`)
        .set(auth())
        .expect(400);
    });
  });

  describe('POST /monitors/:id/resume', () => {
    it('should resume a paused monitor', async () => {
      await request(app.getHttpServer())
        .post(`/monitors/${monitorId}/resume`)
        .set(auth())
        .expect(204);

      const res = await request(app.getHttpServer())
        .get(`/monitors/${monitorId}`)
        .set(auth());

      expect(res.body.status).toBe('ACTIVE');
    });

    it('should return 400 when not paused', async () => {
      await request(app.getHttpServer())
        .post(`/monitors/${monitorId}/resume`)
        .set(auth())
        .expect(400);
    });
  });

  describe('DELETE /monitors/:id', () => {
    it('should delete a monitor', async () => {
      await request(app.getHttpServer())
        .delete(`/monitors/${monitorId}`)
        .set(auth())
        .expect(204);
    });

    it('should return 404 after deletion', async () => {
      await request(app.getHttpServer())
        .get(`/monitors/${monitorId}`)
        .set(auth())
        .expect(404);
    });
  });
});
