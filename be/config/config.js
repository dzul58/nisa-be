const { Pool } = require('pg');

// const pool = new Pool({
//     user: 'postgres',
//     host: '192.168.202.56',
//     database: 'dummy',
//     password: 'Myrep123!',
//     port: 5432,
//   });


  // const poolLogin = new Pool({
  //   user: 'noc',
  //   host: '172.17.32.193',
  //   database: 'nisa',
  //   password: 'noc123!',
  //   port: 5432,
  // });

  const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'nisa',
    password: 'fiqar22',
    port: 5432,
  });


module.exports = pool;