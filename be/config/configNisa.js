const { Pool } = require('pg');

// const pool = new Pool({
//     user: 'postgres',
//     host: '192.168.202.56',
//     database: 'dummy',
//     password: 'Myrep123!',
//     port: 5432,
//   });


  // const poolNisa = new Pool({
  //   user: 'noc',
  //   host: '172.17.32.193',
  //   database: 'nisa',
  //   password: 'noc123!',
  //   port: 5432,
  // });


  // NISA GCP
  // const poolNisa = new Pool({
  //   user: 'noc',
  //   host: '172.17.76.36',
  //   database: 'nisa',
  //   password: 'myrep123!',
  //   port: 5432,
  // });

  // const pool = new Pool({
  //   user: 'postgres',
  //   host: 'localhost',
  //   database: 'nisa',
  //   password: 'fiqar22',
  //   port: 5432,
  // });

  const { Pool } = require('pg');

const poolNisa = new Pool({
  user: 'noc',
  host: '172.17.76.36',
  database: 'nisa',
  password: 'myrep123!',
  port: 5432,
});

poolNisa.on('connect', () => {
  console.log('Connected to database successfully');
});

poolNisa.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

// Test koneksi
poolNisa.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err.stack);
  }
  console.log('Connected to database');
  release();
});

module.exports = poolNisa;
