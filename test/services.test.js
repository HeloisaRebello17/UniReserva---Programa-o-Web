const test = require('node:test');
const assert = require('node:assert/strict');
const { newDb } = require('pg-mem');

const { setDatabaseAdapter, closeDatabase } = require('../src/config/database');
const { bootstrapDatabase } = require('../src/config/bootstrap');
const authService = require('../src/services/authService');
const reservationService = require('../src/services/reservationService');
const roomService = require('../src/services/roomService');

let pool;

test.before(async () => {
  const memoryDb = newDb();
  const pgAdapter = memoryDb.adapters.createPg();
  pool = new pgAdapter.Pool();
  setDatabaseAdapter(pool);
  await bootstrapDatabase(pool);
});

test.after(async () => {
  await closeDatabase();
});

// ========== AUTH SERVICE TESTS ==========

test('authService.login should authenticate user with valid credentials', async () => {
  const result = await authService.login({
    email: 'professor@unireserva.com',
    password: 'prof123'
  });

  assert.ok(result.token);
  assert.equal(result.user.email, 'professor@unireserva.com');
  assert.equal(result.user.type, 'teacher');
});

test('authService.login should reject invalid credentials', async () => {
  await assert.rejects(
    async () => {
      await authService.login({
        email: 'professor@unireserva.com',
        password: 'wrongpassword'
      });
    },
    { message: 'Credenciais inválidas.' }
  );
});

test('authService.login should reject missing email or password', async () => {
  await assert.rejects(
    async () => {
      await authService.login({ email: 'test@test.com' });
    },
    { message: 'E-mail e senha são obrigatórios.' }
  );
});

test('authService.register should create new user with valid data', async () => {
  const result = await authService.register({
    name: 'Novo Usuário',
    email: 'newuser@unireserva.com',
    password: 'newpass123',
    type: 'aluno'
  });

  assert.equal(result.name, 'Novo Usuário');
  assert.equal(result.email, 'newuser@unireserva.com');
  assert.equal(result.type, 'aluno');
});

test('authService.register should reject duplicate email', async () => {
  await assert.rejects(
    async () => {
      await authService.register({
        name: 'Duplicate User',
        email: 'professor@unireserva.com',
        password: 'pass123'
      });
    },
    { message: 'Já existe um usuário com este e-mail.' }
  );
});

test('authService.register should reject missing required fields', async () => {
  await assert.rejects(
    async () => {
      await authService.register({
        name: 'Test User',
        email: 'test@unireserva.com'
      });
    },
    { message: 'Nome, e-mail e senha são obrigatórios.' }
  );
});

test('authService.verifyToken should decode valid JWT token', async () => {
  const loginResult = await authService.login({
    email: 'professor@unireserva.com',
    password: 'prof123'
  });

  const decoded = authService.verifyToken(loginResult.token);
  assert.equal(decoded.email, 'professor@unireserva.com');
  assert.equal(decoded.type, 'teacher');
});

// ========== ROOM SERVICE TESTS ==========

test('roomService.createRoom should create room with valid data', async () => {
  const result = await roomService.createRoom({
    name: 'Sala de Teste',
    capacity: 30,
    type: 'laboratório'
  });

  assert.equal(result.name, 'Sala de Teste');
  assert.equal(result.capacity, 30);
  assert.equal(result.type, 'laboratório');
});

test('roomService.createRoom should reject missing required fields', async () => {
  await assert.rejects(
    async () => {
      await roomService.createRoom({
        name: 'Sala Incompleta',
        capacity: 20
      });
    },
    { message: 'Nome, capacidade e tipo da sala são obrigatórios.' }
  );
});

test('roomService.listRooms should return array of rooms', async () => {
  const rooms = await roomService.listRooms();
  
  assert.ok(Array.isArray(rooms));
  assert.ok(rooms.length >= 1);
});

// ========== RESERVATION SERVICE TESTS ==========

test('reservationService.createReservation should reject invalid time range', async () => {
  await assert.rejects(
    async () => {
      await reservationService.createReservation({
        date: '2026-03-25',
        startTime: '14:00',
        endTime: '13:00',
        roomId: 1,
        userId: 1
      });
    },
    { message: 'O horário de fim deve ser maior que o horário de início.' }
  );
});

test('reservationService.createReservation should reject missing required fields', async () => {
  await assert.rejects(
    async () => {
      await reservationService.createReservation({
        date: '2026-03-25',
        startTime: '14:00'
      });
    },
    { message: 'Data, horários, sala e usuário são obrigatórios.' }
  );
});

test('reservationService.createReservation should reject non-existent room', async () => {
  await assert.rejects(
    async () => {
      await reservationService.createReservation({
        date: '2026-03-25',
        startTime: '14:00',
        endTime: '15:00',
        roomId: 99999,
        userId: 1
      });
    },
    { message: 'Sala não encontrada.' }
  );
});

test('reservationService.createReservation should detect time conflicts', async () => {
  // Create first reservation
  await reservationService.createReservation({
    date: '2026-04-01',
    startTime: '10:00',
    endTime: '11:00',
    roomId: 1,
    userId: 1
  });

  // Try to create conflicting reservation
  await assert.rejects(
    async () => {
      await reservationService.createReservation({
        date: '2026-04-01',
        startTime: '10:30',
        endTime: '11:30',
        roomId: 1,
        userId: 2
      });
    },
    { message: 'Já existe uma reserva para esta sala no horário informado.' }
  );
});

test('reservationService.cancelReservation should allow owner to cancel', async () => {
  const reservation = await reservationService.createReservation({
    date: '2026-04-02',
    startTime: '15:00',
    endTime: '16:00',
    roomId: 2,
    userId: 1
  });

  const cancelled = await reservationService.cancelReservation(
    reservation.id,
    { id: 1, type: 'aluno' }
  );

  assert.equal(cancelled.status, 'cancelada');
});

test('reservationService.cancelReservation should reject unauthorized user', async () => {
  const reservation = await reservationService.createReservation({
    date: '2026-04-03',
    startTime: '16:00',
    endTime: '17:00',
    roomId: 3,
    userId: 1
  });

  await assert.rejects(
    async () => {
      await reservationService.cancelReservation(
        reservation.id,
        { id: 2, type: 'aluno' }
      );
    },
    { message: 'Usuário sem permissão para cancelar esta reserva.' }
  );
});
