import { useState, useEffect, useRef } from 'react'
import { useApp } from '../AppContext'

const RING_RADIUS = 90
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS

export default function AttendenceForm() {
  const { currentUser, clockIn, clockOut, attendanceRecords, todayStr } = useApp()

  
  const myRecord = attendanceRecords.find(
    (r) => r.userId === currentUser.id && !r.timeOutTs && r.date === todayStr()
  )
  const clockedIn = Boolean(myRecord)

  const [, forceTick] = useState(0)
  const [milestone, setMilestone] = useState(null) 
  const lastMilestoneHour = useRef(0)

  useEffect(() => {
    if (!clockedIn) {
      lastMilestoneHour.current = 0
      return
    }
    const interval = setInterval(() => forceTick((n) => n + 1), 1000)
    return () => clearInterval(interval)
  }, [clockedIn])

  
  useEffect(() => {
    if (!clockedIn || !myRecord) return
    const elapsedSeconds = Math.floor((Date.now() - myRecord.timeInTs) / 1000)
    const hoursCompleted = Math.floor(elapsedSeconds / 3600)

    if (hoursCompleted > lastMilestoneHour.current) {
      lastMilestoneHour.current = hoursCompleted
      setMilestone({ hours: hoursCompleted })
      const timeout = setTimeout(() => setMilestone(null), 4000)
      return () => clearTimeout(timeout)
    }
  })

  function formatElapsed(startTs) {
    const totalSeconds = Math.floor((Date.now() - startTs) / 1000)
    const h = Math.floor(totalSeconds / 3600)
    const m = Math.floor((totalSeconds % 3600) / 60)
    const s = totalSeconds % 60
    return {
      display: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`,
      secondsIntoHour: totalSeconds % 3600,
      friendly: h > 0 ? `${h} hr ${m} min` : `${m} min ${s} sec`,
    }
  }

  const elapsed = clockedIn ? formatElapsed(myRecord.timeInTs) : null
  const ringProgress = elapsed ? elapsed.secondsIntoHour / 3600 : 0
  const dashOffset = RING_CIRCUMFERENCE * (1 - ringProgress)

  async function handleClockIn() {
    await clockIn()
  }

  function handleClockOut() {
    clockOut(myRecord.id)
  }

  return (
    <div className="card">
      <h2 className="card-title">Mark Attendance</h2>

      <div className="clock-box">
        <p className="clock-greeting">Hi, {currentUser.name}</p>

        <span className={`clock-status-pill ${clockedIn ? 'clock-status-in' : 'clock-status-out'}`}>
          <span className="clock-status-dot" />
          {clockedIn ? 'Clocked in' : 'Not clocked in'}
        </span>

        <div className="clock-ring-wrap">
          <svg viewBox="0 0 200 200" className="clock-ring-svg">
            <circle cx="100" cy="100" r={RING_RADIUS} fill="none" stroke="var(--border)" strokeWidth="10" />
            <circle
              cx="100" cy="100" r={RING_RADIUS} fill="none"
              stroke="url(#ringGradient)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={RING_CIRCUMFERENCE}
              strokeDashoffset={clockedIn ? dashOffset : RING_CIRCUMFERENCE}
              className="clock-ring-progress"
              transform="rotate(-90 100 100)"
            />
            <defs>
              <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00967d" />
                <stop offset="100%" stopColor="#006d5b" />
              </linearGradient>
            </defs>
          </svg>

          <div className="clock-ring-center">
            <div className="clock-display">
              {clockedIn ? elapsed.display : '00:00:00'}
            </div>
            {clockedIn && <div className="clock-friendly">{elapsed.friendly} today</div>}
          </div>
        </div>

        <div className="clock-actions">
          <button className="btn btn-primary" onClick={handleClockIn} disabled={clockedIn}>
            Clock In
          </button>
          <button className="btn btn-danger" onClick={handleClockOut} disabled={!clockedIn}>
            Clock Out
          </button>
        </div>

        {milestone && (
          <div key={milestone.hours} className="milestone-toast">
            <span className="milestone-icon">🎉</span>
            <span>
              {milestone.hours} hour{milestone.hours > 1 ? 's' : ''} logged today — nice work!
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
