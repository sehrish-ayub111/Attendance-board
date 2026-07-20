import { useState, useEffect } from 'react'
import { useApp } from '../AppContext'

<<<<<<< HEAD
// Returns a greeting text based on the current hour of the day
=======
>>>>>>> old-hrm-project
function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function Login() {
  const { login } = useApp()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
<<<<<<< HEAD
  const [error, setError] = useState('') // login error message, shown below the form
  const [time, setTime] = useState(new Date()) // live clock used for the animated clock illustration

  // Update the clock every second so the analog clock hands stay live/accurate
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t) // cleanup on unmount
  }, [])

  // Attempt login on form submit; show an error if credentials are invalid
=======
  const [error, setError] = useState('')
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

>>>>>>> old-hrm-project
  function handleSubmit(e) {
    e.preventDefault()
    const user = login(username.trim(), password)
    if (!user) {
      setError('Username or password wrong.')
    } else {
      setError('')
    }
  }

<<<<<<< HEAD
  // --- Analog clock hand angle calculations (for the decorative SVG clock) ---
  const hours = time.getHours() % 12 // convert to 12-hour format
  const minutes = time.getMinutes()
  const hourDeg = hours * 30 + minutes * 0.5 // hour hand: 30° per hour + slight nudge per minute
  const minDeg = minutes * 6 // minute hand: 6° per minute (360° / 60 min)

  return (
    <div className="auth-screen">
      {/* Left side: decorative visual panel with greeting text and animated clock */}
=======
  const hours = time.getHours() % 12
  const minutes = time.getMinutes()
  const hourDeg = hours * 30 + minutes * 0.5
  const minDeg = minutes * 6

  return (
    <div className="auth-screen">
>>>>>>> old-hrm-project
      <div className="auth-visual">
        <div className="auth-visual-text">
          <span className="auth-visual-eyebrow">{getGreeting()}</span>
          <h2>Every clock-in,<br />accounted for</h2>
          <p>Attendance, leave requests, and your whole team — tracked in one place.</p>
        </div>

<<<<<<< HEAD
        {/* Animated analog clock illustration */}
        <div className="auth-visual-clock">
          <svg viewBox="0 0 200 200">
            {/* Outer and inner decorative rings */}
            <circle cx="100" cy="100" r="94" fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="1.5" />
            <circle cx="100" cy="100" r="78" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

            {/* 12 hour-marker tick lines, each rotated 30° apart around the clock face */}
=======
        <div className="auth-visual-clock">
          <svg viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="94" fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="1.5" />
            <circle cx="100" cy="100" r="78" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
>>>>>>> old-hrm-project
            {[...Array(12)].map((_, i) => (
              <line
                key={i}
                x1="100" y1="14" x2="100" y2="24"
                stroke="rgba(255,255,255,0.35)"
                strokeWidth="2.5"
                strokeLinecap="round"
                transform={`rotate(${i * 30} 100 100)`}
              />
            ))}
<<<<<<< HEAD

            {/* Hour hand — rotates based on current hour/minute */}
            <line x1="100" y1="100" x2="100" y2="58" stroke="#fff" strokeWidth="5" strokeLinecap="round" style={{ transformOrigin: '100px 100px', transform: `rotate(${hourDeg}deg)` }} />
            {/* Minute hand — rotates based on current minute */}
            <line x1="100" y1="100" x2="100" y2="36" stroke="#8fe3d4" strokeWidth="3.5" strokeLinecap="round" style={{ transformOrigin: '100px 100px', transform: `rotate(${minDeg}deg)` }} />
            {/* Center pivot dot */}
=======
            <line x1="100" y1="100" x2="100" y2="58" stroke="#fff" strokeWidth="5" strokeLinecap="round" style={{ transformOrigin: '100px 100px', transform: `rotate(${hourDeg}deg)` }} />
            <line x1="100" y1="100" x2="100" y2="36" stroke="#8fe3d4" strokeWidth="3.5" strokeLinecap="round" style={{ transformOrigin: '100px 100px', transform: `rotate(${minDeg}deg)` }} />
>>>>>>> old-hrm-project
            <circle cx="100" cy="100" r="5" fill="#fff" />
          </svg>
        </div>

        <div className="auth-visual-footer"></div>
      </div>

<<<<<<< HEAD
      {/* Right side: the actual login form */}
      <div className="auth-form-side">
        <div className="auth-card">
          {/* App branding */}
=======
      <div className="auth-form-side">
        <div className="auth-card">
>>>>>>> old-hrm-project
          <div className="brand">
            <span className="brand-mark">⏱</span>
            <h1>TimeTrack</h1>
          </div>
          <p className="auth-sub">Sign in to your account</p>

          <form onSubmit={handleSubmit} className="auth-form">
            <label>
              Username
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your name"
                required
                autoFocus
              />
            </label>

            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                required
              />
            </label>

<<<<<<< HEAD
            {/* Show login error, if any, above the submit button */}
=======
>>>>>>> old-hrm-project
            {error && <p className="form-error">{error}</p>}

            <button type="submit" className="btn btn-primary btn-block">
              Log in
            </button>
          </form>
        </div>
      </div>
    </div>
  )
<<<<<<< HEAD
}
=======
}
>>>>>>> old-hrm-project
