import mysql from 'mysql2/promise'
// Creating a database connection pool
// Meaning of pool: instead of creating a new connection for every query,
// it reuses existing connections (fast + efficient)
export const pool = mysql.createPool({
    host: 'localhost',                     
    user: 'u486815721_cnhrmattn',          
    password: 'zV&371=}z-X>',              
    database: 'attendance_db',             
    waitForConnections: true,              
    connectionLimit: 10,                   
})