import express from 'express'
import cors from 'cors'
import crypto from 'crypto'
<<<<<<< HEAD
import bcrypt from 'bcrypt' // for securely hashing & comparing passwords
=======
>>>>>>> old-hrm-project
import { pool } from './db.js'

const app = express()
app.use(cors())
<<<<<<< HEAD
app.use(express.json({ limit: '15mb' })) // parse JSON body, max 15mb size allowed
const PORT = process.env.PORT || 4000

// Helper to generate unique IDs (for users, attendance, leaves, etc.)
=======
app.use(express.json({ limit: '15mb' }))
const PORT = process.env.PORT || 4000

>>>>>>> old-hrm-project
function newId() {
    return crypto.randomUUID()
}

<<<<<<< HEAD
// ---------- LOGIN ----------
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body
        // Only fetch by username first (password is checked separately since it's hashed)
        const [rows] = await pool.query(
            'SELECT * FROM users WHERE LOWER(TRIM(username)) = LOWER(TRIM(?)) LIMIT 1',
            [username]
        )
        const user = rows[0]
        if (!user) return res.json({ user: null })

        // Compare plain password with the stored hash
        const match = await bcrypt.compare(password, user.password)
        if (!match) return res.json({ user: null })

        // Don't send the password hash back to the frontend
        const { password: _, ...safeUser } = user
        res.json({ user: safeUser })
=======

app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body
        const [rows] = await pool.query(
            'SELECT * FROM users WHERE LOWER(TRIM(username)) = LOWER(TRIM(?)) AND password = ? LIMIT 1',
            [username, password]
        )
        res.json({ user: rows[0] || null })
>>>>>>> old-hrm-project
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: err.message })
    }
})

<<<<<<< HEAD
// ---------- USERS ----------

// Get all users
app.get('/api/users', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM users')
        // Strip password hashes before sending the list
        const safeRows = rows.map(({ password, ...rest }) => rest)
        res.json(safeRows)
=======
//USERS 
app.get('/api/users', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM users')
        res.json(rows)
>>>>>>> old-hrm-project
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

<<<<<<< HEAD
// Add a new user (password gets hashed before saving)
=======
>>>>>>> old-hrm-project
app.post('/api/users', async (req, res) => {
    try {
        const { username, password, name, email, role } = req.body
        const id = newId()
<<<<<<< HEAD
        const hashedPassword = await bcrypt.hash(password, 10) // 10 = salt rounds

        await pool.query(
            'INSERT INTO users (id, username, password, name, email, role) VALUES (?, ?, ?, ?, ?, ?)',
            [id, username, hashedPassword, name, email || null, role || 'user']
        )
        const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id])
        const { password: _, ...safeUser } = rows[0]
        res.json(safeUser) // return the newly created user, without the hash
=======
        await pool.query(
            'INSERT INTO users (id, username, password, name, email, role) VALUES (?, ?, ?, ?, ?, ?)',
            [id, username, password, name, email || null, role || 'user']
        )
        const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id])
        res.json(rows[0])
>>>>>>> old-hrm-project
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

<<<<<<< HEAD
// Delete a user by id
=======
>>>>>>> old-hrm-project
app.delete('/api/users/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM users WHERE id = ?', [req.params.id])
        res.json({ ok: true })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

<<<<<<< HEAD
// Update any field(s) of a user (dynamic update)
app.patch('/api/users/:id', async (req, res) => {
    try {
        const fields = { ...req.body }

        // If password is being updated, hash it first
        if (fields.password) {
            fields.password = await bcrypt.hash(fields.password, 10)
        }

        const keys = Object.keys(fields)
        if (keys.length === 0) return res.json({ ok: true })

        // Build UPDATE query dynamically from whichever fields were sent
=======
app.patch('/api/users/:id', async (req, res) => {
    try {
        const fields = req.body
        const keys = Object.keys(fields)
        if (keys.length === 0) return res.json({ ok: true })
>>>>>>> old-hrm-project
        const setClause = keys.map((k) => `\`${k}\` = ?`).join(', ')
        await pool.query(`UPDATE users SET ${setClause} WHERE id = ?`, [
            ...keys.map((k) => fields[k]),
            req.params.id,
        ])
        res.json({ ok: true })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

<<<<<<< HEAD
// ---------- ATTENDANCE ----------

// Get all attendance records
app.get('/api/attendance', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM attendance')
        // Rename DB column "data" to "date" for the frontend
=======


app.get('/api/attendance', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM attendance')
>>>>>>> old-hrm-project
        const mapped = rows.map((r) => ({ ...r, date: r.data }))
        res.json(mapped)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

<<<<<<< HEAD
// Clock-in (record arrival time)
=======
>>>>>>> old-hrm-project
app.post('/api/attendance/clockin', async (req, res) => {
    try {
        const { userId, userName, date, timeInTs, late } = req.body
        const id = newId()
        await pool.query(
            'INSERT INTO attendance (id, userId, userName, data, timeInTs, late) VALUES (?, ?, ?, ?, ?, ?)',
            [id, userId, userName, date, timeInTs, late]
        )
        res.json({ id })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

<<<<<<< HEAD
// Clock-out (record departure time)
=======
>>>>>>> old-hrm-project
app.patch('/api/attendance/:id/clockout', async (req, res) => {
    try {
        const { timeOutTs, earlyLeave, overtime } = req.body
        await pool.query(
            'UPDATE attendance SET timeOutTs = ?, earlyLeave = ?, overtime = ? WHERE id = ?',
            [timeOutTs, earlyLeave, overtime, req.params.id]
        )
        res.json({ ok: true })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

<<<<<<< HEAD
// Manually update any field of an attendance record
app.patch('/api/attendance/:id', async (req, res) => {
    try {
        const fields = { ...req.body }
        // Map "date" back to the DB's "data" column
=======

app.patch('/api/attendance/:id', async (req, res) => {
    try {
        const fields = { ...req.body }
>>>>>>> old-hrm-project
        if ('date' in fields) {
            fields.data = fields.date
            delete fields.date
        }
        const keys = Object.keys(fields)
        if (keys.length === 0) return res.json({ ok: true })
        const setClause = keys.map((k) => `\`${k}\` = ?`).join(', ')
        await pool.query(`UPDATE attendance SET ${setClause} WHERE id = ?`, [
            ...keys.map((k) => fields[k]),
            req.params.id,
        ])
        res.json({ ok: true })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

<<<<<<< HEAD
// ---------- LEAVES ----------

// Get all leave requests
=======
//  LEAVES
>>>>>>> old-hrm-project
app.get('/api/leaves', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM leaves')
        res.json(rows)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

<<<<<<< HEAD
// Create a new leave request (status defaults to "pending")
=======
>>>>>>> old-hrm-project
app.post('/api/leaves', async (req, res) => {
    try {
        const { userId, userName, startDate, endDate, days, type, reason } = req.body
        const id = newId()
        await pool.query(
            'INSERT INTO leaves (id, userId, userName, startDate, endDate, days, type, reason, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [id, userId, userName, startDate, endDate, days, type, reason, 'pending']
        )
        res.json({ id })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

<<<<<<< HEAD
// Approve/reject a leave request (update status)
=======
>>>>>>> old-hrm-project
app.patch('/api/leaves/:id/status', async (req, res) => {
    try {
        const { status } = req.body
        await pool.query('UPDATE leaves SET status = ? WHERE id = ?', [status, req.params.id])
        res.json({ ok: true })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

<<<<<<< HEAD
// ---------- MESSAGES ----------

// Get all messages
=======
//  MESSAGES 
>>>>>>> old-hrm-project
app.get('/api/messages', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM messages')
        res.json(rows)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

<<<<<<< HEAD
// Send a new chat message
=======
>>>>>>> old-hrm-project
app.post('/api/messages', async (req, res) => {
    try {
        const { chatId, senderId, senderName, text, timestamp, isAdmin } = req.body
        const id = newId()
<<<<<<< HEAD
        // If admin sent it, mark unread for employee, and vice versa
=======
>>>>>>> old-hrm-project
        await pool.query(
            'INSERT INTO messages (id, chatId, senderId, senderName, text, timestamp, readByAdmin, readByEmployee) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [id, chatId, senderId, senderName, text, timestamp, isAdmin, !isAdmin]
        )
        res.json({ id })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

<<<<<<< HEAD
// Mark messages as read (by admin or employee)
app.patch('/api/messages/mark-read', async (req, res) => {
    try {
        const { chatId, field } = req.body
        // Safety check: only these two fields are allowed, to prevent updating an arbitrary column
=======
app.patch('/api/messages/mark-read', async (req, res) => {
    try {
        const { chatId, field } = req.body 
>>>>>>> old-hrm-project
        if (!['readByAdmin', 'readByEmployee'].includes(field)) {
            return res.status(400).json({ error: 'Invalid field' })
        }
        await pool.query(`UPDATE messages SET \`${field}\` = TRUE WHERE chatId = ?`, [chatId])
        res.json({ ok: true })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

<<<<<<< HEAD
// Start the server
=======
>>>>>>> old-hrm-project
app.listen(PORT, () => {
    console.log(`API server running at http://localhost:${PORT}`)
})