import { createContext, useContext, useState, useEffect } from 'react'
import { db } from './firebase'
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore'

const WEB3FORMS_ACCESS_KEY = '54662f1e-d5b9-466e-aa0e-3a53258f457f'
const AppContext = createContext(null)

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
  threshold.setHours(17, 0, 0, 0)
  return d > threshold
}

export function AppProvider({ children }) {
  const [users, setUsers] = useState([])
  const [currentUser, setCurrentUser] = useState(null)
  const [attendanceRecords, setAttendanceRecords] = useState([])
  const [leaveRecords, setLeaveRecords] = useState([])
  const [messages, setMessages] = useState([])
  const [pendingLeavesTrigger, setPendingLeavesTrigger] = useState(0)
  const [profileTrigger, setProfileTrigger] = useState(0)

  function goToPendingLeaves() {
    setPendingLeavesTrigger((n) => n + 1)
  }

  function goToProfile() {
    setProfileTrigger((n) => n + 1)
  }

  useEffect(() => {
    const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
      setUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    })
    const unsubAttendance = onSnapshot(collection(db, 'attendance'), (snap) => {
      setAttendanceRecords(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    })
    const unsubLeaves = onSnapshot(collection(db, 'leaves'), (snap) => {
      setLeaveRecords(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    })
    const unsubMessages = onSnapshot(collection(db, 'messages'), (snap) => {
      setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    })
    return () => { unsubUsers(); unsubAttendance(); unsubLeaves(); unsubMessages() }
  }, [])

  function login(username, password) {
    const found = users.find((u) => u.username === username && u.password === password)
    if (found) setCurrentUser(found)
    return found || null
  }

  function logout() { setCurrentUser(null) }

  async function addEmployee({ name, email }) {
    const base = email.split('@')[0].toLowerCase()
    let username = base
    let counter = 1
    while (users.some((u) => u.username === username)) {
      username = `${base}${counter}`
      counter++
    }
    const password = generatePassword()
    const newUser = { username, password, role: 'user', name, email }
    const docRef = await addDoc(collection(db, 'users'), newUser)
    return { id: docRef.id, ...newUser }
  }

  async function deleteEmployee(userId) {
    await deleteDoc(doc(db, 'users', userId))
  }

  async function clockIn() {
    const now = Date.now()
    const record = {
      userId: currentUser.id,
      userName: currentUser.name,
      date: todayStr(),
      timeInTs: now,
      timeOutTs: null,
      late: isLate(now),
    }
    const docRef = await addDoc(collection(db, 'attendance'), record)
    return docRef.id
  }

  async function clockOut(recordId) {
    await updateDoc(doc(db, 'attendance', recordId), { timeOutTs: Date.now() })
  }

  async function updateAttendance(recordId, updates) {
    await updateDoc(doc(db, 'attendance', recordId), updates)
  }

  async function addLeave({ startDate, endDate, days, type, reason }) {
    const record = {
      userId: currentUser.id,
      userName: currentUser.name,
      startDate, endDate, days, type, reason,
      status: 'pending',
    }
    await addDoc(collection(db, 'leaves'), record)
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
    await updateDoc(doc(db, 'leaves', id), { status })
  }


  async function updateProfile(updates) {
    await updateDoc(doc(db, 'users', currentUser.id), updates)
    setCurrentUser((prev) => ({ ...prev, ...updates }))
  }


  async function sendMessage({ chatId, text }) {
    const isAdmin = currentUser.role === 'admin'
    await addDoc(collection(db, 'messages'), {
      chatId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      text,
      timestamp: Date.now(),
      readByAdmin: isAdmin,
      readByEmployee: !isAdmin,
    })
  }

  async function markChatRead(chatId) {
    const isAdmin = currentUser.role === 'admin'
    const unread = messages.filter(
      (m) => m.chatId === chatId && (isAdmin ? !m.readByAdmin : !m.readByEmployee)
    )
    await Promise.all(
      unread.map((m) =>
        updateDoc(doc(db, 'messages', m.id),
          isAdmin ? { readByAdmin: true } : { readByEmployee: true }
        )
      )
    )
  }

  const value = {
    currentUser, login, logout,
    users, addEmployee, deleteEmployee,
    todayStr,
    attendanceRecords, clockIn, clockOut, updateAttendance,
    leaveRecords, addLeave, updateLeaveStatus,
    pendingLeavesTrigger, goToPendingLeaves,
    profileTrigger, goToProfile,
    messages, sendMessage, markChatRead,
    updateProfile,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  return useContext(AppContext)
}
