const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  user: 'postgres',
  password: 'Jesu1981@',
  database: 'task_manager',
  port: 5432
});

module.exports = pool;
