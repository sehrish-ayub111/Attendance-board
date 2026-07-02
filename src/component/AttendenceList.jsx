import { useState, useEffect } from 'react'
import { useApp } from '../AppContext'
import Modal from './Modal'

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'today', label: 'Today' },
  { key: 'yesterday', label: 'Yesterday' },
  { key: 'week', label: 'Last Week' },
  { key: 'month', label: 'Last Month' },
]

function startOfDay(timestampOrDate) {
  const d = new Date(timestampOrDate)
  d.setHours(0, 0, 0, 0)
  return d
}

function tsToHHMM(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function hhmmToTs(dateStr, hhmm) {
  if (!hhmm) return null
  const [h, m] = hhmm.split(':').map(Number)
  const d = new Date(dateStr)
  d.setHours(h, m, 0, 0)
  return d.getTime()
}


function currentMonthKey() {
  return new Date().toISOString().slice(0, 7)
}


export default function AttendenceList({ mode }) {
  const { currentUser, attendanceRecords, updateAttendance } = useApp()
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  const [editingRecord, setEditingRecord] = useState(null)
  const [editDate, setEditDate] = useState('')
  const [editTimeIn, setEditTimeIn] = useState('')
  const [editTimeOut, setEditTimeOut] = useState('')
  const [editNote, setEditNote] = useState('')

  const [showReason, setShowReason] = useState(null)

function openReason(note){
  setShowReason(note)
}

function closeReason(){
  setShowReason(null)
}


  function startEdit(r) {
    setEditingRecord(r)
    setEditDate(r.date)
    setEditTimeIn(tsToHHMM(r.timeInTs))
    setEditTimeOut(tsToHHMM(r.timeOutTs))
    setEditNote(r.editNote || '')
  }

  function closeEdit() {
    setEditingRecord(null)
  }

  async function saveEdit() {
    try {
      await updateAttendance(editingRecord.id, {
        date: editDate,
        timeInTs: hhmmToTs(editDate, editTimeIn),
        timeOutTs: editTimeOut ? hhmmToTs(editDate, editTimeOut) : null,
        editNote: editNote || null,
      })
      setEditingRecord(null)
    } catch (err) {
      setShowReason('Edit not save : ' + err.message)
      console.error(err)
    }
  }

  const baseRows =
    mode === 'admin'
      ? attendanceRecords
      : attendanceRecords.filter((r) => r.userId === currentUser.id)

  const hasActiveRecord = baseRows.some((r) => !r.timeOutTs)
  const [, forceTick] = useState(0)

  useEffect(() => {
    if (!hasActiveRecord) return
    const interval = setInterval(() => forceTick((n) => n + 1), 1000)
    return () => clearInterval(interval)
  }, [hasActiveRecord])

  function matchesFilter(record) {
    if (filter === 'all') return true
    const recordDay = startOfDay(record.timeInTs)
    const today = startOfDay(Date.now())
    const diffDays = Math.round((today - recordDay) / (1000 * 60 * 60 * 24))

    if (filter === 'today') return diffDays === 0
    if (filter === 'yesterday') return diffDays === 1
    if (filter === 'week') return diffDays >= 0 && diffDays <= 7
    if (filter === 'month') return diffDays >= 0 && diffDays <= 30
    return true
  }

  const rows = baseRows
    .filter(matchesFilter)
    .filter((r) => r.userName.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => (b.timeInTs || 0) - (a.timeInTs || 0))

  function formatClock(ts) {
    if (!ts) return '--'
    return new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  function formatDuration(startTs, endTs) {
    const end = endTs || Date.now()
    const totalSeconds = Math.floor((end - startTs) / 1000)
    const h = Math.floor(totalSeconds / 3600)
    const m = Math.floor((totalSeconds % 3600) / 60)
    const s = totalSeconds % 60
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }


  const monthKey = currentMonthKey()
  const monthRecords = attendanceRecords.filter((r) => r.date && r.date.startsWith(monthKey))

 
  const myMonthDays = new Set(
    monthRecords.filter((r) => r.userId === currentUser.id).map((r) => r.date)
  ).size

  
  const summaryMap = {}
  monthRecords.forEach((r) => {
    if (!summaryMap[r.userName]) summaryMap[r.userName] = new Set()
    summaryMap[r.userName].add(r.date)
  })
  const summaryList = Object.entries(summaryMap).map(([name, datesSet]) => ({
    name,
    count: datesSet.size,
  }))

  return (
      
    <>
  {showReason && (
  <div
    style={{
      position: 'absolute',
      top: '20%',
      left: '50%',
      transform: 'translateX(-50%)',
      background: '#fff',
      border: '1px solid #ccc',
      borderRadius: 8,
      padding: 16,
      boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
      zIndex: 2000,
    }}
  >
    <h3>Reason</h3>
    <p>{showReason}</p>
    <button onClick={closeReason}>Close</button>
  </div>
)}

    <div className="card">
      <div className="card-header-row">
        <h2 className="card-title">
          {mode === 'admin' ? 'All Attendance Records' : 'My Attendance'}
        </h2>
        <div className="filter-bar">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              className={`tab tab-sm ${filter === f.key ? 'tab-active' : ''}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {mode === 'admin' && (
        <input
          type="text"
          className="search-input"
          placeholder="search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      )}

      {rows.length === 0 ? (
        <p className="empty-state">empty.</p>
      ) : (
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Date</th>
                <th>Time In</th>
                <th>Time Out</th>
                <th>Working Hours</th>
                <th>Status</th>
                <th>Note</th>
                {mode === 'admin' && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const working = !r.timeOutTs
                return (
                  <tr key={r.id}>
                    <td>{r.userName}</td>
                    <td className="mono">{r.date}</td>
                    <td className="mono">{formatClock(r.timeInTs)}</td>
                    <td className="mono">{working ? '--' : formatClock(r.timeOutTs)}</td>
                    <td className="mono">{formatDuration(r.timeInTs, r.timeOutTs)}</td>
                    <td>
                      {r.late ? (
                        <span className="status-pill status-rejected">Late</span>
                      ) : (
                        <span className="muted">—</span>
                      )}
                    </td>
                    <td>
                      {r.editNote ? (
                        <button
                          className="flag-icon"
                          onClick={() => openReason(r.editNote)}
                        >
                       reason
                        </button>
                      ) : (
                        <span className="muted">—</span>
                      )}
                    </td>
                    {mode === 'admin' && (
                      <td className="actions">
                        <button className="btn btn-sm btn-primary" onClick={() => startEdit(r)}>
                          Edit
                        </button>
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {mode === 'own' ? (
        <div className="month-summary">
        My Month Days: <strong>{myMonthDays} days</strong>
        </div>
      ) : (
        <div className="month-summary-admin">
          <h3 className="card-subtitle">Monthly Attendance Summary</h3>
          {summaryList.length === 0 ? (
            <p className="empty-state">empty.</p>
          ) : (
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Days This Month</th>
                  </tr>
                </thead>
                <tbody>
                  {summaryList.map((s) => (
                    <tr key={s.name}>
                      <td>{s.name}</td>
                      <td className="mono">{s.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      
      {editingRecord && (
        <Modal title="Edit Attendance" onClose={closeEdit}>
          <label>
            Date
            <input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} />
          </label>
          <label>
            Time In
            <input
              type="time"
              value={editTimeIn}
              onChange={(e) => setEditTimeIn(e.target.value)}
            />
          </label>
          <label>
            Time Out
            <input
              type="time"
              value={editTimeOut}
              onChange={(e) => setEditTimeOut(e.target.value)}
            />
          </label>
          <label>
            Edit reason
            <input
              type="text"
              value={editNote}
              onChange={(e) => setEditNote(e.target.value)}
            />
          </label>
          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={closeEdit}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={saveEdit}>
              Save
            </button>
          </div>
        </Modal>
      )}
    </div>
    </>
  )
}
