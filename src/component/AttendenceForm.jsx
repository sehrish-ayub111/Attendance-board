import { useState, useEffect } from 'react'
import { useApp } from '../AppContext'

export default function AttendenceForm() {
  const { currentUser, clockIn, clockOut, attendanceRecords } = useApp()

  const [activeId, setActiveId] = useState(null)
  const myRecord = attendanceRecords.find((r) => r.id === activeId)
  const clockedIn = myRecord && !myRecord.timeOutTs


  const [, forceTick] = useState(0)

  useEffect(() => {
    if (!clockedIn) return
    const interval = setInterval(() => forceTick((n) => n + 1), 1000)
    return () => clearInterval(interval)
  }, [clockedIn])

  function formatElapsed(startTs) {
    const totalSeconds = Math.floor((Date.now() - startTs) / 1000)
    const h = Math.floor(totalSeconds / 3600)
    const m = Math.floor((totalSeconds % 3600) / 60)
    const s = totalSeconds % 60
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  async function handleClockIn() {
    const id = await clockIn()
    setActiveId(id)
  }

  function handleClockOut() {
    clockOut(activeId)
  }

  return (
    <div className="card">
      <h2 className="card-title">Mark Attendance</h2>

      <div className="clock-box">
        <p className="clock-greeting">Hi, {currentUser.name}</p>

        <div className="clock-display">
          {clockedIn ? formatElapsed(myRecord.timeInTs) : '00:00:00'}
        </div>



        <div className="clock-actions">
          <button className="btn btn-primary" onClick={handleClockIn} disabled={clockedIn}>
            Clock In
          </button>
          <button className="btn btn-danger" onClick={handleClockOut} disabled={!clockedIn}>
            Clock Out
          </button>
        </div>
      </div>
    </div>
  )
}
