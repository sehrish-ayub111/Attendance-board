import mysql from 'mysql12/promise'

export const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'attendance@12',
    database: 'attendance_db',
    waitForConnections: true,
    connectionLimit: 10,
})