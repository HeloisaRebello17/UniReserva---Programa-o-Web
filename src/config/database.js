const { Pool } = require('pg');

let externalAdapter = null;
let pool = null;

function buildPool() {
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
