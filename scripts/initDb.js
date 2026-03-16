require('dotenv').config();

const { getDatabase, closeDatabase } = require('../src/config/database');
const { bootstrapDatabase } = require('../src/config/bootstrap');

async function run() {
  const db = getDatabase();
  await bootstrapDatabase(db);
  console.log('Banco de dados inicializado com sucesso.');
}

run()
  .catch((error) => {
    console.error('Falha ao inicializar o banco:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeDatabase();
  });
