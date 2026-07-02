import { useState } from 'react'
import { useApp } from "../AppContext"

export default function Login({onSwitchToSignup}) {
  const { login } = useApp()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    const user = login(username.trim(), password)
    if (!user) {
      setError('Username or password wrong.')
    } else {
      setError('')
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="brand">
          <span className="brand-mark">⏱</span>
          <h1>TimeTrack</h1>
        </div>
        <p className="auth-sub">Attendance </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Username
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter Name"
              required
            />
          </label>

          <label>
            Password
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
              required
            />
          </label>

          {error && <p className="form-error">{error}</p>}

          <button type="submit" className="btn btn-primary btn-block">
            Login
          </button>
        </form>
  

         </div>
    </div>
  )
}