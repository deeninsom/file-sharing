const mysql = require('mysql2')
require('dotenv').config()


const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'jodi',
    database: '',
});

connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DATABASE_NAME || 'db_file_shared'}`, function (err) {
    if (err) {
        console.error('Error creating database:', err.message);
    } else {
        console.log('Database created successfully.');
    }

    connection.end();
});