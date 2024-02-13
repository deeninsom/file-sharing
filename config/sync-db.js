const mysql = require('mysql2')
require('dotenv').config()


const connection = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
    database: '',
});

connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.MYSQL_DATABASE || 'db_file_shared'}`, function (err) {
    if (err) {
        console.error('Error creating database:', err.message);
    } else {
        console.log('Database created successfully.');
    }

    connection.end();
});
