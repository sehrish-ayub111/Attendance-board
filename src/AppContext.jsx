import { createContext, useContext, useState, useEffect, useRef } from 'react'
import { api } from './apiClients'

const WEB3FORMS_ACCESS_KEY = '54662f1e-d5b9-466e-aa0e-3a53258f457f'
const AppContext = createContext(null)

const POLL_INTERVAL_MS = 3000 

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

function generatePassword() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let pass = ''
  for (let i = 0; i < 6; i++) {
    pass += chars[Math.floor(Math.random() * chars.length)]
  }
  return pass
}

function isLate(timestamp) {
  const d = new Date(timestamp)
  const threshold = new Date(d)
  threshold.setHours(11, 0, 0, 0)
  return d > threshold
}

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
    setToasts((t) => [...t, { id, message, type }])
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id))
    }, 3200)
  }

  const currentUserRef = useRef(currentUser)
  currentUserRef.current = currentUser

  function goToPendingLeaves() {
    setPendingLeavesTrigger((n) => n + 1)
  }

  function goToProfile() {
    setProfileTrigger((n) => n + 1)
  }

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


      if (currentUserRef.current) {
        const updated = u.find((x) => x.id === currentUserRef.current.id)
        if (updated) setCurrentUser(updated)
      }
    } catch (err) {
      console.error('Refresh failed — is the backend server running?', err.message)
    }
  }

  useEffect(() => {
    refreshAll()
    const interval = setInterval(refreshAll, POLL_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [])

  
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

  function login(username, password) {
    const cleanUsername = username.trim().toLowerCase()
    const found = users.find(
      (u) => u.username.trim().toLowerCase() === cleanUsername && u.password === password
    )
    if (found) setCurrentUser(found)
    return found || null
  }

  function logout() {
    setCurrentUser(null)
  }

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

  async function deleteEmployee(userId) {
    await api.del(`/users/${userId}`)
    await refreshAll()
    showToast('Employee removed')
  }

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

  async function updateAttendance(recordId, updates) {
    await api.patch(`/attendance/${recordId}`, updates)
    await refreshAll()
  }

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
      console.error('Email fail:', err.message || err)
    }
  }

  async function updateLeaveStatus(id, status) {
    await api.patch(`/leaves/${id}/status`, { status })
    await refreshAll()
    showToast(`Leave ${status}`, status === 'rejected' ? 'error' : 'success')
  }

  //  PROFILE
  async function updateProfile(updates) {
    await api.patch(`/users/${currentUser.id}`, updates)
    setCurrentUser((prev) => ({ ...prev, ...updates }))
    await refreshAll()
    showToast('Profile updated')
  }

  
  async function updateUser(userId, updates) {
    await api.patch(`/users/${userId}`, updates)
    await refreshAll()
    showToast('Employee details updated')
  }

  //  CHAT 
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

  async function markChatRead(chatId) {
    const isAdmin = currentUser.role === 'admin'
    await api.patch('/messages/mark-read', {
      chatId,
      field: isAdmin ? 'readByAdmin' : 'readByEmployee',
    })
    await refreshAll()
  }

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

export function useApp() {
  return useContext(AppContext)
}