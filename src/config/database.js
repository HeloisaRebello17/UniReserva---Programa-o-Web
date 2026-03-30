const { Pool } = require('pg');
const store = require('../data/store');

let externalAdapter = null;
let pool = null;

// Mock database adapter para desenvolvimento sem PostgreSQL
class MockDatabase {
  async query(sql, params = []) {
    const sqlLower = sql.toLowerCase();
    
    // Ignorar CREATE TABLE e comentários
    if (sqlLower.includes('create table') || sqlLower.startsWith('--')) {
      return { rows: [] };
    }

    // SELECT users WHERE email
    if (sqlLower.includes('select') && sqlLower.includes('from users') && sqlLower.includes('where email')) {
      const email = params[0];
      const user = store.users.find(u => u.email === email);
      return { rows: user ? [user] : [] };
    }

    // INSERT INTO users
    if (sqlLower.includes('insert into users')) {
      const newUser = {
        id: Math.max(...store.users.map(u => u.id), 0) + 1,
        name: params[0],
        email: params[1],
        password: params[2],
        type: params[3] || 'common'
      };
      store.users.push(newUser);
      return { rows: [newUser] };
    }

    // SELECT FROM rooms
    if (sqlLower.includes('select') && sqlLower.includes('from rooms') && !sqlLower.includes('where')) {
      return { rows: store.rooms };
    }

    // SELECT FROM rooms WHERE id
    if (sqlLower.includes('select') && sqlLower.includes('from rooms') && sqlLower.includes('where id')) {
      const id = params[0];
      const room = store.rooms.find(r => r.id === id);
      return { rows: room ? [room] : [] };
    }

    // INSERT INTO rooms
    if (sqlLower.includes('insert into rooms')) {
      const newRoom = {
        id: Math.max(...store.rooms.map(r => r.id), 0) + 1,
        name: params[0],
        capacity: params[1],
        type: params[2]
      };
      store.rooms.push(newRoom);
      return { rows: [newRoom] };
    }

    // DELETE FROM rooms WHERE id
    if (sqlLower.includes('delete from rooms') && sqlLower.includes('where id')) {
      const id = Number(params[0]);
      const roomIndex = store.rooms.findIndex(r => Number(r.id) === id);
      if (roomIndex === -1) {
        return { rows: [] };
      }

      const [deletedRoom] = store.rooms.splice(roomIndex, 1);
      // Simula ON DELETE CASCADE do PostgreSQL para reservas vinculadas.
      store.reservations = store.reservations.filter(r => Number(r.room_id) !== id);
      return { rows: [deletedRoom] };
    }

    // SELECT FROM reservations - encontrar conflitos
    if (
      sqlLower.includes('from reservations') &&
      sqlLower.includes('where room_id') &&
      sqlLower.includes('status <>') &&
      sqlLower.includes('limit 1')
    ) {
      const roomId = params[0];
      const date = params[1];
      const startTime = params[2];
      const endTime = params[3];
      
      const conflict = store.reservations.find(r => 
        r.room_id === roomId && 
        r.date === date && 
        r.status !== 'cancelada' &&
        r.start_time < endTime &&
        r.end_time > startTime
      );
      
      return { rows: conflict ? [{ id: conflict.id }] : [] };
    }

    // SELECT FROM reservations - conflito por usuário
    if (
      sqlLower.includes('from reservations') &&
      sqlLower.includes('where user_id') &&
      sqlLower.includes('status <>') &&
      sqlLower.includes('limit 1')
    ) {
      const userId = Number(params[0]);
      const date = params[1];
      const startTime = params[2];
      const endTime = params[3];

      const conflict = store.reservations.find(r =>
        Number(r.user_id) === userId &&
        r.date === date &&
        r.status !== 'cancelada' &&
        r.start_time < endTime &&
        r.end_time > startTime
      );

      return { rows: conflict ? [{ id: conflict.id }] : [] };
    }

    // INSERT INTO reservations
    if (sqlLower.includes('insert into reservations')) {
      const newReservation = {
        id: Math.max(...store.reservations.map(r => r.id || 0), 0) + 1,
        date: params[0],
        start_time: params[1],
        end_time: params[2],
        room_id: params[3],
        user_id: params[4],
        status: 'ativa'
      };
      store.reservations.push(newReservation);
      return { rows: [newReservation] };
    }

    // SELECT FROM reservations WHERE user_id
    if (sqlLower.includes('select') && sqlLower.includes('from reservations') && sqlLower.includes('where user_id')) {
      const userId = params[0];
      const userRes = store.reservations.filter(r => r.user_id === userId);
      return { rows: userRes };
    }

    // UPDATE reservations - cancelar
    if (sqlLower.includes('update reservations')) {
      const resId = params[0];
      const reservation = store.reservations.find(r => r.id === resId);
      if (reservation) {
        reservation.status = 'cancelada';
        return { rows: [reservation] };
      }
      return { rows: [] };
    }

    // SELECT FROM reservations
    if (sqlLower.includes('select') && sqlLower.includes('from reservations')) {
      return { rows: store.reservations };
    }

    return { rows: [] };
  }

  async end() {
    return Promise.resolve();
  }
}

function buildPool() {
  // Em desenvolvimento, usa banco em memória
  if (process.env.NODE_ENV !== 'production') {
    return new MockDatabase();
  }

  return new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/unireserva'
  });
}

function getDatabase() {
  if (externalAdapter) {
    return externalAdapter;
  }

  if (!pool) {
    pool = buildPool();
  }

  return pool;
}

function setDatabaseAdapter(adapter) {
  externalAdapter = adapter;
}

async function closeDatabase() {
  if (externalAdapter && typeof externalAdapter.end === 'function') {
    await externalAdapter.end();
    externalAdapter = null;
    return;
  }

  if (pool) {
    await pool.end();
    pool = null;
  }
}

module.exports = {
  getDatabase,
  setDatabaseAdapter,
  closeDatabase
};
