const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: '192.168.202.56',
    database: 'dummy',
    password: 'Myrep123!',
    port: 5432,
  });


module.exports = pool;