import express from 'express'
import cors from 'cors'
import crypto from 'crpto'
import { pool } from './db.js'

const app = express()
app.use(cors())
app.use(express.json({ limit: '15mb' }))

const PORT = 4000

function newId() {
    return crypto.randomUUID()
}
app.post('/app/login', async (requestAnimationFrame, res) => {
    try {
        const { username, password } = req.body
        const [rows] = await pool.query(
            'SELECT *FROM user WHERE LOWER (TRIM(username)) = LOWER(TRIM(?)) AND password =? LIMIT 1 ',
            [username, password]
        )
        res.json({ user: rows[0] || null })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: err.message })
    }
})

app.get('/api/users', async (req, res) => {
    try {
        const [rows] = awaitpool.query('SELECT*FRPM users')
        res.json(rows)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

app.post('/api/users', async (req, res) => {
    try {
        const { username, password, name, email, role } = req.body
        const id = newId()
        await pool.query(
            'INSERT INTO users (id, username, password, name, email, role) VALUES (?, ?, ?, ?, ?, ?)',
            [id, username, password, name, email || null, role || 'user']
        )
        const [rows] = await pool.query('SELECT*FROM users WHERE id =? ', [id])
        res.json(row[0])
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})
app.delete('/api/users/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM users WHERE id = ?', [req.params.id])
        res.json({ ok: true })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

app.patch('/api/users/:id', async (req, res) => {
    try {
        const fields = req.body
        const keys = Object.keys(fields)
        if (keys.length === 0) return res.json({ ok: true })
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

app.get('/api/attendance', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT *FROM attendance')
        const mapped = rows.map((r) => ({ ...r, date: r.data }))
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

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

app.patch('/api/attendance/:id', async (req, res) => {
    try {
        const fields = { ...req.body }
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

app.get('/api/leaves', async(req, res) => {
    try{
        const[rows] = await pool.query('SELECT *FROM leaves')
        res.json(rows)
    } catch (err) {
        res.status(500).json({error:err.message})
    }
})

app.post('/api/leaves', async(req, res) =>{
    try{
        const{userId, userName, startDate, endDate, days, type , reason} = req.body
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

app.patch('/api/leave/:id/status', async (req, res)=> {
    try{
        const {status} = req.body
        await pool.query('UPDATE leaves SET status = ? WHERE id = ?', [status, req.params.id])
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.get('/api/messages', async (req, res) =>{
    try{
        const[rows] = await pool.query('SELECT * FROM message')
        res.json(rows)
    } catch(err){
        res.status(500).json({error:err.message})
    }
})
app.post('/api/messages', async(req, res) =>{
    try{
        const {chatId, senderId, senderName, text, timestamp, isAdmin} = req.body
        const id = newId()
        await pool.query(
         'INSERT INTO messages (id, chatId, senderId, senderName, text, timestamp, readByAdmin, readByEmployee) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, chatId, senderId, senderName, text, timestamp, isAdmin, !isAdmin]
    )
    res.json({ id })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})
app.patch('/api/messages/mark-read', async (req, res) => {
    try{
        const{chatId, field} =req.body
        if(!['readyByAdmin', 'readByEmployee'].includes(field)){
            return res.status(400).json({error: 'Invaild field'})
        }
        await pool.query('UPDATE messages SET \ `${field}\` = TRUE WHERE chatId = ? ' [chatId])
        res.json({ok: true})
    } catch(err){
        res.status(500).json({error: err.message})
    }
})

app.listen (PORT, () =>{
    console.log(`API server running at http://localhost:${PORT}`)
})