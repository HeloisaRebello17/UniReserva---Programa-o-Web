const fs = require('fs/promises');
const path = require('path');

async function bootstrapDatabase(db) {
  const schemaPath = path.join(__dirname, '..', '..', 'db', 'schema.sql');
  const seedPath = path.join(__dirname, '..', '..', 'db', 'seed.sql');

  const schemaSql = await fs.readFile(schemaPath, 'utf8');
  const seedSql = await fs.readFile(seedPath, 'utf8');

  await db.query(schemaSql);
  await db.query(seedSql);
}

module.exports = {
  bootstrapDatabase
};
