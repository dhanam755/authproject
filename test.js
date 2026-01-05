const pool = require('./config/db');

pool.query('SELECT NOW()')
.then(res => {
    console.log('PostgreSQL connected:', res.rows);
})
.catch(err => {
    console.error('Connection error', err);
});
