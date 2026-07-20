import { createContext, useContext, useState, useEffect, useRef } from 'react'
<<<<<<< HEAD
import { api } from './apiClient'

// Access key for Web3Forms (used to email admin about new leave requests)
const WEB3FORMS_ACCESS_KEY = '54662f1e-d5b9-466e-aa0e-3a53258f457f'

// Global app context — provides all shared state and actions to every component
const AppContext = createContext(null)

// How often (in ms) the app polls the backend for fresh data
const POLL_INTERVAL_MS = 3000

// Returns today's date as "YYYY-MM-DD"
=======
import { api } from './apiClients'

const WEB3FORMS_ACCESS_KEY = '54662f1e-d5b9-466e-aa0e-3a53258f457f'
const AppContext = createContext(null)

const POLL_INTERVAL_MS = 3000 

>>>>>>> old-hrm-project
function todayStr() {
  return new Date().toISOString().split('T')[0]
}

<<<<<<< HEAD
// Generates a random 6-character password for new employees
// (excludes visually confusing characters like 0/O, 1/l/I)
=======
>>>>>>> old-hrm-project
function generatePassword() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let pass = ''
  for (let i = 0; i < 6; i++) {
    pass += chars[Math.floor(Math.random() * chars.length)]
  }
  return pass
}

<<<<<<< HEAD
// Determines if a given clock-in timestamp counts as "late"
// (cutoff is 11:00 AM on that same day)
=======
>>>>>>> old-hrm-project
function isLate(timestamp) {
  const d = new Date(timestamp)
  const threshold = new Date(d)
  threshold.setHours(11, 0, 0, 0)
  return d > threshold
}

<<<<<<< HEAD
// Wraps the whole app and provides shared state/actions via context
export function AppProvider({ children }) {
  const [users, setUsers] = useState([])
  const [usersLoaded, setUsersLoaded] = useState(false) // true once the first successful fetch completes
  const [currentUser, setCurrentUser] = useState(null) // the logged-in user (admin or employee)
  const [attendanceRecords, setAttendanceRecords] = useState([])
  const [leaveRecords, setLeaveRecords] = useState([])
  const [messages, setMessages] = useState([])
  const [pendingLeavesTrigger, setPendingLeavesTrigger] = useState(0) // increments to signal "jump to pending leaves tab"
  const [profileTrigger, setProfileTrigger] = useState(0) // increments to signal "jump to profile tab"
  const [toasts, setToasts] = useState([]) // active toast notifications

  // Adds a toast notification, auto-removing it after ~3.2 seconds
  function showToast(message, type = 'success') {
    const id = Date.now() + Math.random() // simple unique id
=======
export function AppProvider({ children }) {
  const [users, setUsers] = useState([])
  const [usersLoaded, setUsersLoaded] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [attendanceRecords, setAttendanceRecords] = useState([])
  const [leaveRecords, setLeaveRecords] = useState([])
  const [messages, setMessages] = useState([])
  const [pendingLeavesTrigger, setPendingLeavesTrigger] = useState(0)
  const [profileTrigger, setProfileTrigger] = useState(0)
  const [toasts, setToasts] = useState([])

  function showToast(message, type = 'success') {
    const id = Date.now() + Math.random()
>>>>>>> old-hrm-project
    setToasts((t) => [...t, { id, message, type }])
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id))
    }, 3200)
  }

<<<<<<< HEAD
  // Keep a ref to the latest currentUser value, so refreshAll() (used inside
  // a setInterval closure) can always read the current value instead of a stale one
  const currentUserRef = useRef(currentUser)
  currentUserRef.current = currentUser

  // Called by NavBar's bell icon — tells AdminDashboard to switch to the "leaves" tab
=======
  const currentUserRef = useRef(currentUser)
  currentUserRef.current = currentUser

>>>>>>> old-hrm-project
  function goToPendingLeaves() {
    setPendingLeavesTrigger((n) => n + 1)
  }

<<<<<<< HEAD
  // Called by NavBar's user chip — tells the dashboard to switch to the "profile" tab
=======
>>>>>>> old-hrm-project
  function goToProfile() {
    setProfileTrigger((n) => n + 1)
  }

<<<<<<< HEAD
  // Fetches all core data from the backend in parallel and updates state.
  // Also re-syncs currentUser with the latest data (e.g. if their profile was edited).
=======
>>>>>>> old-hrm-project
  async function refreshAll() {
    try {
      const [u, a, l, m] = await Promise.all([
        api.get('/users'),
        api.get('/attendance'),
        api.get('/leaves'),
        api.get('/messages'),
      ])
      setUsers(u)
      setAttendanceRecords(a)
      setLeaveRecords(l)
      setMessages(m)
      setUsersLoaded(true)

<<<<<<< HEAD
      // If someone is logged in, refresh their user object with the latest data
      // from the server (e.g. picks up profile edits made elsewhere)
=======

>>>>>>> old-hrm-project
      if (currentUserRef.current) {
        const updated = u.find((x) => x.id === currentUserRef.current.id)
        if (updated) setCurrentUser(updated)
      }
    } catch (err) {
      console.error('Refresh failed — is the backend server running?', err.message)
    }
  }

<<<<<<< HEAD
  // On mount: do an initial data fetch, then poll the backend every POLL_INTERVAL_MS
  // to keep data fresh (simple alternative to websockets/real-time updates)
=======
>>>>>>> old-hrm-project
  useEffect(() => {
    refreshAll()
    const interval = setInterval(refreshAll, POLL_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [])

<<<<<<< HEAD
  // Auto-closes "stale" attendance records: any record from a PAST day that's
  // still open (no timeOutTs) gets automatically clocked out at 23:59:59 of
  // that day, so forgotten clock-ins don't count forever
=======
  
>>>>>>> old-hrm-project
  useEffect(() => {
    const today = todayStr()
    const stale = attendanceRecords.filter((r) => !r.timeOutTs && r.date && r.date !== today)

    stale.forEach((r) => {
      const endOfDay = new Date(r.date)
      endOfDay.setHours(23, 59, 59, 999)
      api
        .patch(`/attendance/${r.id}`, { timeOutTs: endOfDay.getTime(), autoClosed: true })
        .catch((err) => console.error('Auto-close failed:', err))
    })
  }, [attendanceRecords])

<<<<<<< HEAD
  // Attempts to log in with username/password.
  // Special case: a hardcoded fallback admin account (admin/admin123) always
  // works, even if the backend has no matching admin user yet.
  function login(username, password) {
    const cleanUsername = username.trim().toLowerCase()
    if (cleanUsername === 'admin' && password === 'admin123') {
      const fallbackAdmin = {
        id: 'temp-admin-id',
        username: 'Admin',
        password: 'admin123',
        name: 'Admin',
        email: 'admin@example.com',
        role: 'admin',
      }
      setCurrentUser(fallbackAdmin)
      return fallbackAdmin
    }

    // Otherwise, look for a matching user in the loaded users list
=======
  function login(username, password) {
    const cleanUsername = username.trim().toLowerCase()
>>>>>>> old-hrm-project
    const found = users.find(
      (u) => u.username.trim().toLowerCase() === cleanUsername && u.password === password
    )
    if (found) setCurrentUser(found)
    return found || null
  }

<<<<<<< HEAD
  // Logs the current user out (clears local state only)
=======
>>>>>>> old-hrm-project
  function logout() {
    setCurrentUser(null)
  }

<<<<<<< HEAD
  // Creates a new employee account: auto-generates a unique username from
  // their email (adding a number suffix if taken) and a random password
=======
>>>>>>> old-hrm-project
  async function addEmployee({ name, email }) {
    const base = email.split('@')[0].toLowerCase()
    let username = base
    let counter = 1
    while (users.some((u) => u.username === username)) {
      username = `${base}${counter}`
      counter++
    }
    const password = generatePassword()
    const newUser = await api.post('/users', { username, password, role: 'user', name, email })
    await refreshAll()
    showToast('Employee added successfully')
    return newUser
  }

<<<<<<< HEAD
  // Deletes an employee account
=======
>>>>>>> old-hrm-project
  async function deleteEmployee(userId) {
    await api.del(`/users/${userId}`)
    await refreshAll()
    showToast('Employee removed')
  }

<<<<<<< HEAD
  // Clocks the current user in: creates a new attendance record for today,
  // marking it late if past the cutoff time
=======
>>>>>>> old-hrm-project
  async function clockIn() {
    const now = Date.now()
    const { id } = await api.post('/attendance/clockin', {
      userId: currentUser.id,
      userName: currentUser.name,
      date: todayStr(),
      timeInTs: now,
      late: isLate(now),
    })
    await refreshAll()
    showToast('Clocked in successfully')
    return id
  }

<<<<<<< HEAD
  // Clocks the current user out of a specific attendance record.
  // Flags whether it was an early leave or overtime relative to a 7:00 PM cutoff.
=======
>>>>>>> old-hrm-project
  async function clockOut(recordId) {
    const now = Date.now()
    const closingTime = new Date(now)
    closingTime.setHours(19, 0, 0, 0)

    await api.patch(`/attendance/${recordId}/clockout`, {
      timeOutTs: now,
      earlyLeave: now < closingTime.getTime(),
      overtime: now > closingTime.getTime(),
    })
    await refreshAll()
    showToast('Clocked out successfully')
  }

<<<<<<< HEAD
  // Generic update for an attendance record (used by the admin's "Edit" modal)
=======
>>>>>>> old-hrm-project
  async function updateAttendance(recordId, updates) {
    await api.patch(`/attendance/${recordId}`, updates)
    await refreshAll()
  }

<<<<<<< HEAD
  // Submits a new leave request for the current user, then also fires off
  // an email notification via Web3Forms (best-effort — failure is logged but ignored)
=======
>>>>>>> old-hrm-project
  async function addLeave({ startDate, endDate, days, type, reason }) {
    await api.post('/leaves', {
      userId: currentUser.id,
      userName: currentUser.name,
      startDate, endDate, days, type, reason,
    })
    await refreshAll()
    showToast('Leave request submitted')

    try {
      await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          subject: `New Leave Request from ${currentUser.name}`,
          email: currentUser.email,
          employee_name: currentUser.name,
          leave_type: type,
          start_date: startDate,
          end_date: endDate,
          days, reason,
        }),
      })
    } catch (err) {
<<<<<<< HEAD
      // Don't block/fail the leave submission just because the email notification failed
=======
>>>>>>> old-hrm-project
      console.error('Email fail:', err.message || err)
    }
  }

<<<<<<< HEAD
  // Approves or rejects a leave request (admin action)
=======
>>>>>>> old-hrm-project
  async function updateLeaveStatus(id, status) {
    await api.patch(`/leaves/${id}/status`, { status })
    await refreshAll()
    showToast(`Leave ${status}`, status === 'rejected' ? 'error' : 'success')
  }

<<<<<<< HEAD
  // --- PROFILE ---
  // Updates the current user's own profile; optimistically updates local
  // state immediately (so UI feels instant), then syncs with the backend
=======
  //  PROFILE
>>>>>>> old-hrm-project
  async function updateProfile(updates) {
    await api.patch(`/users/${currentUser.id}`, updates)
    setCurrentUser((prev) => ({ ...prev, ...updates }))
    await refreshAll()
    showToast('Profile updated')
  }

<<<<<<< HEAD
  // Updates any employee's details (admin editing someone else's profile)
=======
  
>>>>>>> old-hrm-project
  async function updateUser(userId, updates) {
    await api.patch(`/users/${userId}`, updates)
    await refreshAll()
    showToast('Employee details updated')
  }

<<<<<<< HEAD
  // --- CHAT ---
  // Sends a chat message in a given conversation (chatId), tagging whether
  // it was sent by the admin or an employee
=======
  //  CHAT 
>>>>>>> old-hrm-project
  async function sendMessage({ chatId, text }) {
    const isAdmin = currentUser.role === 'admin'
    await api.post('/messages', {
      chatId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      text,
      timestamp: Date.now(),
      isAdmin,
    })
    await refreshAll()
  }

<<<<<<< HEAD
  // Marks all messages in a chat as read, using the correct "read" field
  // depending on whether the current user is admin or employee
=======
>>>>>>> old-hrm-project
  async function markChatRead(chatId) {
    const isAdmin = currentUser.role === 'admin'
    await api.patch('/messages/mark-read', {
      chatId,
      field: isAdmin ? 'readByAdmin' : 'readByEmployee',
    })
    await refreshAll()
  }

<<<<<<< HEAD
  // Everything exposed to the rest of the app via useApp()
=======
>>>>>>> old-hrm-project
  const value = {
    currentUser, login, logout,
    users, addEmployee, deleteEmployee, usersLoaded,
    todayStr,
    attendanceRecords, clockIn, clockOut, updateAttendance,
    leaveRecords, addLeave, updateLeaveStatus,
    pendingLeavesTrigger, goToPendingLeaves,
    profileTrigger, goToProfile,
    messages, sendMessage, markChatRead,
    updateProfile, updateUser,
    toasts, showToast,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

<<<<<<< HEAD
// Convenience hook — lets any component do `const { ... } = useApp()`
// instead of importing useContext + AppContext everywhere
=======
>>>>>>> old-hrm-project
export function useApp() {
  return useContext(AppContext)
}