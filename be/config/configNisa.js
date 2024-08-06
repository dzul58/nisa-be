const { Pool } = require('pg');

// const pool = new Pool({
//     user: 'postgres',
//     host: '192.168.202.56',
//     database: 'dummy',
//     password: 'Myrep123!',
//     port: 5432,
//   });


  const poolNisa = new Pool({
    user: 'noc',
    host: '172.17.76.36',
    database: 'nisa',
    password: 'myrep123!',
    port: 5432,
  });

  // const pool = new Pool({
  //   user: 'postgres',
  //   host: 'localhost',
  //   database: 'nisa',
  //   password: 'fiqar22',
  //   port: 5432,
  // });


module.exports = poolNisa;