import { useState, useEffect, useRef } from 'react'
import { useApp } from '../AppContext'

<<<<<<< HEAD
// Radius and full circumference of the circular progress ring (used for the clock-in timer visual)
=======
>>>>>>> old-hrm-project
const RING_RADIUS = 90
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS

export default function AttendenceForm() {
  const { currentUser, clockIn, clockOut, attendanceRecords, todayStr } = useApp()

<<<<<<< HEAD
  // Find today's attendance record for the current user where they've clocked in
  // but haven't clocked out yet (i.e. an active/open session)
=======
  
>>>>>>> old-hrm-project
  const myRecord = attendanceRecords.find(
    (r) => r.userId === currentUser.id && !r.timeOutTs && r.date === todayStr()
  )
  const clockedIn = Boolean(myRecord)

<<<<<<< HEAD
  // Dummy state just to force a re-render every second (so the live timer updates on screen)
  const [, forceTick] = useState(0)

  // Currently shown milestone toast (e.g. "1 hour logged"), null = no toast visible
  const [milestone, setMilestone] = useState(null)

  // Tracks the last hour milestone we already showed a toast for, to avoid repeating it
  const lastMilestoneHour = useRef(0)

  // While clocked in, tick every second to keep the live timer/ring updated.
  // Reset the milestone tracker when clocking out.
=======
  const [, forceTick] = useState(0)
  const [milestone, setMilestone] = useState(null) 
  const lastMilestoneHour = useRef(0)

>>>>>>> old-hrm-project
  useEffect(() => {
    if (!clockedIn) {
      lastMilestoneHour.current = 0
      return
    }
    const interval = setInterval(() => forceTick((n) => n + 1), 1000)
<<<<<<< HEAD
    return () => clearInterval(interval) // cleanup on unmount or when clockedIn changes
  }, [clockedIn])

  // Runs on every render (no dependency array) to check if a new full hour has passed
  // since clock-in, and if so, shows a celebratory milestone toast for a few seconds
=======
    return () => clearInterval(interval)
  }, [clockedIn])

  
>>>>>>> old-hrm-project
  useEffect(() => {
    if (!clockedIn || !myRecord) return
    const elapsedSeconds = Math.floor((Date.now() - myRecord.timeInTs) / 1000)
    const hoursCompleted = Math.floor(elapsedSeconds / 3600)

<<<<<<< HEAD
    // Only trigger when we've crossed into a NEW hour we haven't celebrated yet
    if (hoursCompleted > lastMilestoneHour.current) {
      lastMilestoneHour.current = hoursCompleted
      setMilestone({ hours: hoursCompleted })
      // Auto-hide the toast after 4 seconds
=======
    if (hoursCompleted > lastMilestoneHour.current) {
      lastMilestoneHour.current = hoursCompleted
      setMilestone({ hours: hoursCompleted })
>>>>>>> old-hrm-project
      const timeout = setTimeout(() => setMilestone(null), 4000)
      return () => clearTimeout(timeout)
    }
  })

<<<<<<< HEAD
  // Calculates elapsed time since clock-in and formats it in a few useful ways
=======
>>>>>>> old-hrm-project
  function formatElapsed(startTs) {
    const totalSeconds = Math.floor((Date.now() - startTs) / 1000)
    const h = Math.floor(totalSeconds / 3600)
    const m = Math.floor((totalSeconds % 3600) / 60)
    const s = totalSeconds % 60
    return {
<<<<<<< HEAD
      display: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`, // HH:MM:SS format
      secondsIntoHour: totalSeconds % 3600, // how far into the current hour (used for ring progress)
      friendly: h > 0 ? `${h} hr ${m} min` : `${m} min ${s} sec`, // human-readable summary
    }
  }

  // Only compute elapsed time/ring progress if the user is currently clocked in
  const elapsed = clockedIn ? formatElapsed(myRecord.timeInTs) : null
  const ringProgress = elapsed ? elapsed.secondsIntoHour / 3600 : 0 // 0 to 1, how full the ring should be for the current hour
  const dashOffset = RING_CIRCUMFERENCE * (1 - ringProgress) // SVG stroke-dashoffset trick to animate the ring filling up

  // Clock the current user in (calls context function, likely does an API/state update)
=======
      display: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`,
      secondsIntoHour: totalSeconds % 3600,
      friendly: h > 0 ? `${h} hr ${m} min` : `${m} min ${s} sec`,
    }
  }

  const elapsed = clockedIn ? formatElapsed(myRecord.timeInTs) : null
  const ringProgress = elapsed ? elapsed.secondsIntoHour / 3600 : 0
  const dashOffset = RING_CIRCUMFERENCE * (1 - ringProgress)

>>>>>>> old-hrm-project
  async function handleClockIn() {
    await clockIn()
  }

<<<<<<< HEAD
  // Clock the current user out using their active record's ID
=======
>>>>>>> old-hrm-project
  function handleClockOut() {
    clockOut(myRecord.id)
  }

  return (
    <div className="card">
      <h2 className="card-title">Mark Attendance</h2>

      <div className="clock-box">
        <p className="clock-greeting">Hi, {currentUser.name}</p>

<<<<<<< HEAD
        {/* Status pill showing whether the user is currently clocked in or not */}
=======
>>>>>>> old-hrm-project
        <span className={`clock-status-pill ${clockedIn ? 'clock-status-in' : 'clock-status-out'}`}>
          <span className="clock-status-dot" />
          {clockedIn ? 'Clocked in' : 'Not clocked in'}
        </span>

<<<<<<< HEAD
        {/* Circular progress ring showing how far into the current hour the user is */}
        <div className="clock-ring-wrap">
          <svg viewBox="0 0 200 200" className="clock-ring-svg">
            {/* Background/track circle (always fully visible, light color) */}
            <circle cx="100" cy="100" r={RING_RADIUS} fill="none" stroke="var(--border)" strokeWidth="10" />
            {/* Foreground progress circle — fills up based on dashOffset, resets each hour */}
=======
        <div className="clock-ring-wrap">
          <svg viewBox="0 0 200 200" className="clock-ring-svg">
            <circle cx="100" cy="100" r={RING_RADIUS} fill="none" stroke="var(--border)" strokeWidth="10" />
>>>>>>> old-hrm-project
            <circle
              cx="100" cy="100" r={RING_RADIUS} fill="none"
              stroke="url(#ringGradient)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={RING_CIRCUMFERENCE}
<<<<<<< HEAD
              strokeDashoffset={clockedIn ? dashOffset : RING_CIRCUMFERENCE} // full offset (empty ring) when not clocked in
              className="clock-ring-progress"
              transform="rotate(-90 100 100)" // start the progress from the top (12 o'clock position)
            />
            {/* Gradient definition used for the progress ring's color */}
=======
              strokeDashoffset={clockedIn ? dashOffset : RING_CIRCUMFERENCE}
              className="clock-ring-progress"
              transform="rotate(-90 100 100)"
            />
>>>>>>> old-hrm-project
            <defs>
              <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00967d" />
                <stop offset="100%" stopColor="#006d5b" />
              </linearGradient>
            </defs>
          </svg>

<<<<<<< HEAD
          {/* Text displayed in the center of the ring: live timer + friendly summary */}
=======
>>>>>>> old-hrm-project
          <div className="clock-ring-center">
            <div className="clock-display">
              {clockedIn ? elapsed.display : '00:00:00'}
            </div>
            {clockedIn && <div className="clock-friendly">{elapsed.friendly} today</div>}
          </div>
        </div>

<<<<<<< HEAD
        {/* Clock In / Clock Out buttons — each disabled depending on current state */}
=======
>>>>>>> old-hrm-project
        <div className="clock-actions">
          <button className="btn btn-primary" onClick={handleClockIn} disabled={clockedIn}>
            Clock In
          </button>
          <button className="btn btn-danger" onClick={handleClockOut} disabled={!clockedIn}>
            Clock Out
          </button>
        </div>

<<<<<<< HEAD
        {/* Celebratory toast shown briefly whenever a new full hour is completed */}
=======
>>>>>>> old-hrm-project
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
<<<<<<< HEAD
}
=======
}
>>>>>>> old-hrm-project
