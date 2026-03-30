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

test('reservation with end time before or equal start time is rejected', async () => {
  const loginResponse = await request(app)
    .post('/api/auth/login')
    .send({ email: 'professor@unireserva.com', password: 'prof123' });

  const token = loginResponse.body.token;

  const invalidTimeResponse = await request(app)
    .post('/api/reservations')
    .set('Authorization', `Bearer ${token}`)
    .send({
      roomId: 1,
      date: '2026-03-22',
      startTime: '19:00',
      endTime: '18:00'
    });

  assert.equal(invalidTimeResponse.statusCode, 400);
  assert.equal(invalidTimeResponse.body.message, 'O horário de fim deve ser maior que o horário de início.');
});

test('admin can create and delete rooms, teacher cannot delete rooms', async () => {
  const adminLogin = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@unireserva.com', password: 'admin123' });
  const teacherLogin = await request(app)
    .post('/api/auth/login')
    .send({ email: 'professor@unireserva.com', password: 'prof123' });

  assert.equal(adminLogin.statusCode, 200);
  assert.equal(teacherLogin.statusCode, 200);

  const adminToken = adminLogin.body.token;
  const teacherToken = teacherLogin.body.token;

  const createRoomResponse = await request(app)
    .post('/api/rooms')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      name: 'Sala Teste Admin',
      capacity: 12,
      type: 'sala comum'
    });

  assert.equal(createRoomResponse.statusCode, 201);
  assert.ok(createRoomResponse.body.id);

  const roomId = createRoomResponse.body.id;

  const teacherDeleteAttempt = await request(app)
    .delete(`/api/rooms/${roomId}`)
    .set('Authorization', `Bearer ${teacherToken}`);

  assert.equal(teacherDeleteAttempt.statusCode, 403);

  const adminDelete = await request(app)
    .delete(`/api/rooms/${roomId}`)
    .set('Authorization', `Bearer ${adminToken}`);

  assert.equal(adminDelete.statusCode, 200);
  assert.equal(adminDelete.body.id, roomId);
});

test('admin can cancel reservation created by another user', async () => {
  const adminLogin = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@unireserva.com', password: 'admin123' });
  const teacherLogin = await request(app)
    .post('/api/auth/login')
    .send({ email: 'professor@unireserva.com', password: 'prof123' });

  const adminToken = adminLogin.body.token;
  const teacherToken = teacherLogin.body.token;

  const reservationResponse = await request(app)
    .post('/api/reservations')
    .set('Authorization', `Bearer ${teacherToken}`)
    .send({
      roomId: 1,
      date: '2026-03-25',
      startTime: '10:00',
      endTime: '11:00'
    });

  assert.equal(reservationResponse.statusCode, 201);

  const cancelResponse = await request(app)
    .delete(`/api/reservations/${reservationResponse.body.id}`)
    .set('Authorization', `Bearer ${adminToken}`);

  assert.equal(cancelResponse.statusCode, 200);
  assert.equal(cancelResponse.body.status, 'cancelada');
});

test('same user cannot create overlapping reservations even in different rooms', async () => {
  const teacherLogin = await request(app)
    .post('/api/auth/login')
    .send({ email: 'professor@unireserva.com', password: 'prof123' });

  const teacherToken = teacherLogin.body.token;

  const firstReservation = await request(app)
    .post('/api/reservations')
    .set('Authorization', `Bearer ${teacherToken}`)
    .send({
      roomId: 1,
      date: '2026-03-26',
      startTime: '14:00',
      endTime: '15:00'
    });

  assert.equal(firstReservation.statusCode, 201);

  const overlapReservation = await request(app)
    .post('/api/reservations')
    .set('Authorization', `Bearer ${teacherToken}`)
    .send({
      roomId: 2,
      date: '2026-03-26',
      startTime: '14:30',
      endTime: '15:30'
    });

  assert.equal(overlapReservation.statusCode, 409);
  assert.equal(overlapReservation.body.message, 'Usuário já possui uma reserva neste horário.');
});
