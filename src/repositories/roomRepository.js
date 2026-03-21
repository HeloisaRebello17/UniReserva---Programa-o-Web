const { getDatabase } = require('../config/database');

async function listRooms() {
  const db = getDatabase();
  const result = await db.query('SELECT id, name, capacity, type FROM rooms ORDER BY id');
  return result.rows;
}

async function findRoomById(id) {
  const db = getDatabase();
  const result = await db.query('SELECT id, name, capacity, type FROM rooms WHERE id = $1 LIMIT 1', [id]);
  return result.rows[0] || null;
}

async function findRoomByReference(reference) {
  const db = getDatabase();
  const normalizedReference = String(reference).trim();
  const result = await db.query(
    `SELECT id, name, capacity, type
     FROM rooms
     WHERE LOWER(name) = LOWER($1)
        OR name ILIKE '%' || $1 || '%'
     ORDER BY CASE WHEN LOWER(name) = LOWER($1) THEN 0 ELSE 1 END, id
     LIMIT 1`,
    [normalizedReference]
  );

  return result.rows[0] || null;
}

async function createRoom({ name, capacity, type }) {
  const db = getDatabase();
  const result = await db.query(
    'INSERT INTO rooms (name, capacity, type) VALUES ($1, $2, $3) RETURNING id, name, capacity, type',
    [name, capacity, type]
  );

  return result.rows[0];
}

module.exports = {
  listRooms,
  findRoomById,
  findRoomByReference,
  createRoom
};
