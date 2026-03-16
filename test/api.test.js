const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { newDb } = require('pg-mem');

const { setDatabaseAdapter, closeDatabase } = require('../src/config/database');
const { bootstrapDatabase } = require('../src/config/bootstrap');

let app;

test.before(async () => {
  const memoryDb = newDb();
  const pgAdapter = memoryDb.adapters.createPg();
  const pool = new pgAdapter.Pool();
  setDatabaseAdapter(pool);
  await bootstrapDatabase(pool);
  app = require('../src/app');
});

test.after(async () => {
  await closeDatabase();
});

test('GET /api/health returns API status', async () => {
  const response = await request(app).get('/api/health');
  assert.equal(response.statusCode, 200);
  assert.equal(response.body.status, 'ok');
});

test('login, list rooms and create reservation flow works', async () => {
  const loginResponse = await request(app)
    .post('/api/auth/login')
    .send({ email: 'professor@unireserva.com', password: 'prof123' });

  assert.equal(loginResponse.statusCode, 200);
  assert.ok(loginResponse.body.token);

  const token = loginResponse.body.token;

  const roomsResponse = await request(app)
    .get('/api/rooms')
    .set('Authorization', `Bearer ${token}`);

  assert.equal(roomsResponse.statusCode, 200);
  assert.ok(Array.isArray(roomsResponse.body));
  assert.ok(roomsResponse.body.length >= 1);

  const reservationResponse = await request(app)
    .post('/api/reservations')
    .set('Authorization', `Bearer ${token}`)
    .send({
      roomId: 1,
      date: '2026-03-20',
      startTime: '19:00',
      endTime: '20:00'
    });

  assert.equal(reservationResponse.statusCode, 201);
  assert.equal(reservationResponse.body.roomId, 1);
  assert.equal(reservationResponse.body.status, 'ativa');
});

test('conflicting reservation is rejected', async () => {
  const loginResponse = await request(app)
    .post('/api/auth/login')
    .send({ email: 'professor@unireserva.com', password: 'prof123' });

  const token = loginResponse.body.token;

  const initialReservation = await request(app)
    .post('/api/reservations')
    .set('Authorization', `Bearer ${token}`)
    .send({
      roomId: 2,
      date: '2026-03-21',
      startTime: '19:00',
      endTime: '20:00'
    });

  assert.equal(initialReservation.statusCode, 201);

  const conflictResponse = await request(app)
    .post('/api/reservations')
    .set('Authorization', `Bearer ${token}`)
    .send({
      roomId: 2,
      date: '2026-03-21',
      startTime: '19:30',
      endTime: '20:30'
    });

  assert.equal(conflictResponse.statusCode, 409);
});
