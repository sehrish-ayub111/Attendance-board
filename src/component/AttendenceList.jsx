import { useState, useEffect } from 'react'
import { useApp } from '../AppContext'
import Modal from './Modal'

<<<<<<< HEAD
// Filter tabs for narrowing down the attendance table by date range
=======
>>>>>>> old-hrm-project
const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'today', label: 'Today' },
  { key: 'yesterday', label: 'Yesterday' },
  { key: 'week', label: 'Last Week' },
  { key: 'month', label: 'Last Month' },
]

<<<<<<< HEAD
// Returns a Date object set to midnight (00:00:00) of the given date/timestamp,
// used to compare "which day" something happened on, ignoring time-of-day
=======
>>>>>>> old-hrm-project
function startOfDay(timestampOrDate) {
  const d = new Date(timestampOrDate)
  d.setHours(0, 0, 0, 0)
  return d
}

<<<<<<< HEAD
// Converts a timestamp into "HH:MM" string format (24-hour), for use in <input type="time">
=======
>>>>>>> old-hrm-project
function tsToHHMM(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

<<<<<<< HEAD
// Combines a date string with an "HH:MM" time string to produce a full timestamp
=======
>>>>>>> old-hrm-project
function hhmmToTs(dateStr, hhmm) {
  if (!hhmm) return null
  const [h, m] = hhmm.split(':').map(Number)
  const d = new Date(dateStr)
  d.setHours(h, m, 0, 0)
  return d.getTime()
}

<<<<<<< HEAD
// Returns current month in "YYYY-MM" format, used to filter this month's records
=======

>>>>>>> old-hrm-project
function currentMonthKey() {
  return new Date().toISOString().slice(0, 7)
}

<<<<<<< HEAD
export default function AttendenceList({ mode }) {
  // mode is either 'admin' (see everyone's records) or 'own' (see only current user's records)
  const { currentUser, attendanceRecords, updateAttendance } = useApp()

  const [filter, setFilter] = useState('all') // active date filter (all/today/yesterday/week/month)
  const [search, setSearch] = useState('') // search text for filtering by employee name (admin mode)

  // State for the "Edit Attendance" modal
  const [editingRecord, setEditingRecord] = useState(null) // the record currently being edited (null = modal closed)
=======

export default function AttendenceList({ mode }) {
  const { currentUser, attendanceRecords, updateAttendance } = useApp()
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  const [editingRecord, setEditingRecord] = useState(null)
>>>>>>> old-hrm-project
  const [editDate, setEditDate] = useState('')
  const [editTimeIn, setEditTimeIn] = useState('')
  const [editTimeOut, setEditTimeOut] = useState('')
  const [editNote, setEditNote] = useState('')

<<<<<<< HEAD
  // State for the small popup that shows the reason/note behind an edited record
  const [showReason, setShowReason] = useState(null)

  function openReason(note) {
    setShowReason(note)
  }

  function closeReason() {
    setShowReason(null)
  }

  // Pre-fill the edit form fields with an existing record's data and open the modal
=======
  const [showReason, setShowReason] = useState(null)

function openReason(note){
  setShowReason(note)
}

function closeReason(){
  setShowReason(null)
}


>>>>>>> old-hrm-project
  function startEdit(r) {
    setEditingRecord(r)
    setEditDate(r.date)
    setEditTimeIn(tsToHHMM(r.timeInTs))
    setEditTimeOut(tsToHHMM(r.timeOutTs))
    setEditNote(r.editNote || '')
  }

<<<<<<< HEAD
  // Close the edit modal without saving
=======
>>>>>>> old-hrm-project
  function closeEdit() {
    setEditingRecord(null)
  }

<<<<<<< HEAD
  // Save changes made in the edit modal by calling the context's update function
=======
>>>>>>> old-hrm-project
  async function saveEdit() {
    try {
      await updateAttendance(editingRecord.id, {
        date: editDate,
        timeInTs: hhmmToTs(editDate, editTimeIn),
        timeOutTs: editTimeOut ? hhmmToTs(editDate, editTimeOut) : null,
        editNote: editNote || null,
      })
<<<<<<< HEAD
      setEditingRecord(null) // close modal on success
    } catch (err) {
      // On failure, reuse the "reason" popup to show the error message to the admin
=======
      setEditingRecord(null)
    } catch (err) {
>>>>>>> old-hrm-project
      setShowReason('Edit not save : ' + err.message)
      console.error(err)
    }
  }

<<<<<<< HEAD
  // Base set of records depends on mode: admin sees all, employee sees only their own
=======
>>>>>>> old-hrm-project
  const baseRows =
    mode === 'admin'
      ? attendanceRecords
      : attendanceRecords.filter((r) => r.userId === currentUser.id)

<<<<<<< HEAD
  // Check if there's any record still "open" (clocked in, no time-out yet)
  const hasActiveRecord = baseRows.some((r) => !r.timeOutTs)

  // Dummy state used purely to force a re-render every second, so live-duration
  // calculations (for open/active records) keep updating on screen
  const [, forceTick] = useState(0)

  // Only run the live-updating timer while there's an active (clocked-in) record
=======
  const hasActiveRecord = baseRows.some((r) => !r.timeOutTs)
  const [, forceTick] = useState(0)

>>>>>>> old-hrm-project
  useEffect(() => {
    if (!hasActiveRecord) return
    const interval = setInterval(() => forceTick((n) => n + 1), 1000)
    return () => clearInterval(interval)
  }, [hasActiveRecord])

<<<<<<< HEAD
  // Checks whether a record falls within the currently selected date filter
=======
>>>>>>> old-hrm-project
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

<<<<<<< HEAD
  // Final table rows: apply date filter, then name search, then sort newest first
=======
>>>>>>> old-hrm-project
  const rows = baseRows
    .filter(matchesFilter)
    .filter((r) => r.userName.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => (b.timeInTs || 0) - (a.timeInTs || 0))

<<<<<<< HEAD
  // Formats a timestamp as "HH:MM" for display in the table
=======
>>>>>>> old-hrm-project
  function formatClock(ts) {
    if (!ts) return '--'
    return new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

<<<<<<< HEAD
  // Calculates and formats the worked duration between clock-in and clock-out
  function formatDuration(startTs, endTs, dateStr) {
    let end = endTs
    if (!end) {
      // Open record (not clocked out yet) — if it's today, count live up to now.
      // Otherwise, cap the count at midnight of that day so it doesn't keep
      // growing forever for old/forgotten open records.
=======
  function formatDuration(startTs, endTs, dateStr) {
    let end = endTs
    if (!end) {
      // Open record — agar aaj ka hai to abhi tak live count, warna
      // us din ki raat 12 baje (midnight) tak hi ginte hain, hamesha
      // ke liye badhta nahi rahega.
>>>>>>> old-hrm-project
      const endOfDay = new Date(dateStr)
      endOfDay.setHours(23, 59, 59, 999)
      end = Math.min(Date.now(), endOfDay.getTime())
    }
    const totalSeconds = Math.floor((end - startTs) / 1000)
    const h = Math.floor(totalSeconds / 3600)
    const m = Math.floor((totalSeconds % 3600) / 60)
    const s = totalSeconds % 60
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

<<<<<<< HEAD
  // --- Monthly summary calculations ---
  const monthKey = currentMonthKey()
  // All attendance records that fall within the current month
  const monthRecords = attendanceRecords.filter((r) => r.date && r.date.startsWith(monthKey))

  // Count of unique days the CURRENT user attended this month (used in "own" mode)
=======

  const monthKey = currentMonthKey()
  const monthRecords = attendanceRecords.filter((r) => r.date && r.date.startsWith(monthKey))

 
>>>>>>> old-hrm-project
  const myMonthDays = new Set(
    monthRecords.filter((r) => r.userId === currentUser.id).map((r) => r.date)
  ).size

<<<<<<< HEAD
  // Build a map of { employeeName -> Set of unique attended dates } for this month (admin mode)
=======
  
>>>>>>> old-hrm-project
  const summaryMap = {}
  monthRecords.forEach((r) => {
    if (!summaryMap[r.userName]) summaryMap[r.userName] = new Set()
    summaryMap[r.userName].add(r.date)
  })
<<<<<<< HEAD
  // Convert the map into a list of { name, count } for rendering in the summary table
=======
>>>>>>> old-hrm-project
  const summaryList = Object.entries(summaryMap).map(([name, datesSet]) => ({
    name,
    count: datesSet.size,
  }))

  return (
<<<<<<< HEAD
    <>
      {/* Small floating popup showing the reason/note text for an edited record, or an error message */}
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
        {/* Header row: title + date filter tabs */}
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

        {/* Search box only shown in admin mode, to filter by employee name */}
        {mode === 'admin' && (
          <input
            type="text"
            className="search-input"
            placeholder="search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        )}

        {/* Main attendance table, or empty state if no rows match */}
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
                  // "working" = still clocked in, OR was auto-closed by the system (so no real time-out to show)
                  const working = !r.timeOutTs || r.autoClosed
                  return (
                    <tr key={r.id}>
                      <td>{r.userName}</td>
                      <td className="mono">{r.date}</td>
                      <td className="mono">{formatClock(r.timeInTs)}</td>
                      <td className="mono">{working ? '--' : formatClock(r.timeOutTs)}</td>
                      <td className="mono">{formatDuration(r.timeInTs, r.timeOutTs, r.date)}</td>
                      <td>
                        {/* Status badges: late arrival, early leave, overtime — or a dash if none apply */}
                        <div className="status-pill-group">
                          {r.late && <span className="status-pill status-rejected">Late</span>}
                          {r.earlyLeave && <span className="status-pill status-pending">Early Leave</span>}
                          {r.overtime && <span className="status-pill status-approved">Overtime</span>}
                          {!r.late && !r.earlyLeave && !r.overtime && <span className="muted">—</span>}
                        </div>
                      </td>
                      <td>
                        {/* If this record was manually edited, show a button to view the edit reason */}
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
                      {/* Edit button only visible to admin */}
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

        {/* Bottom summary section: differs based on mode */}
        {mode === 'own' ? (
          // Employee view: just their own total attended days this month
          <div className="month-summary">
            My Month Days: <strong>{myMonthDays} days</strong>
          </div>
        ) : (
          // Admin view: table summarizing every employee's attended days this month
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

        {/* Edit Attendance modal — only rendered when an admin clicks "Edit" on a record */}
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
=======
      
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
                const working = !r.timeOutTs || r.autoClosed
                return (
                  <tr key={r.id}>
                    <td>{r.userName}</td>
                    <td className="mono">{r.date}</td>
                    <td className="mono">{formatClock(r.timeInTs)}</td>
                    <td className="mono">{working ? '--' : formatClock(r.timeOutTs)}</td>
                    <td className="mono">{formatDuration(r.timeInTs, r.timeOutTs, r.date)}</td>
                    <td>
                      <div className="status-pill-group">
                        {r.late && <span className="status-pill status-rejected">Late</span>}
                        {r.earlyLeave && <span className="status-pill status-pending">Early Leave</span>}
                        {r.overtime && <span className="status-pill status-approved">Overtime</span>}
                        {!r.late && !r.earlyLeave && !r.overtime && <span className="muted">—</span>}
                      </div>
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
>>>>>>> old-hrm-project
