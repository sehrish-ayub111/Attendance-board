import mysql from 'mysql2/promise'

export const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'attendance@12',
    database: 'attendance_db',
    waitForConnections: true,
    connectionLimit: 10,
})