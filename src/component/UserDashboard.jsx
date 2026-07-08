import { useState, useEffect, useRef } from 'react'
import { useApp } from '../AppContext'
import AttendenceForm from './AttendenceForm'
import AttendenceList from './AttendenceList'
import LeaveForm from './LeaveForm'
import LeaveList from './LeaveList'
import ChatScreen from './ChatScreen'
import ChatBot from './ChatBot'
import Profile from './Profile'
import StatCards from './StatCards'

const TABS = [
  { key: 'mark', label: 'Mark Attendance' },
  { key: 'myAttendance', label: 'My Attendance' },
  { key: 'applyLeave', label: 'Apply Leave' },
  { key: 'myLeaves', label: 'My Leaves' },
  { key: 'chat', label: 'Chat' },
]

export default function UserDashboard() {
  const { currentUser, messages, profileTrigger, users, attendanceRecords, leaveRecords, todayStr } = useApp()
  const [activeTab, setActiveTab] = useState('mark')
  const [chatOpen, setChatOpen] = useState(false)

  const adminUser = users.find((u) => u.role === 'admin')


  const profileBaseline = useRef(profileTrigger)

  useEffect(() => {
    if (profileTrigger > profileBaseline.current) {
      setActiveTab('profile')
      setChatOpen(false)
    }
  }, [profileTrigger])

  const unread = messages.filter(
    (m) => m.chatId === currentUser.id && !m.readByEmployee
  ).length

 
  const monthKey = todayStr().slice(0, 7)
  const myAttendance = attendanceRecords.filter((r) => r.userId === currentUser.id)
  const myMonthDays = new Set(
    myAttendance.filter((r) => r.date && r.date.startsWith(monthKey)).map((r) => r.date)
  ).size
  const isClockedInToday = myAttendance.some((r) => r.date === todayStr() && !r.timeOutTs)

  const myLeaves = leaveRecords.filter((l) => l.userId === currentUser.id)
  const myPendingLeaves = myLeaves.filter((l) => l.status === 'pending').length
  const myApprovedLeaves = myLeaves.filter((l) => l.status === 'approved').length

  const statCards = [
    { label: "Today's Status", value: isClockedInToday ? 'Clocked In' : 'Not In', icon: '🕒', color: isClockedInToday ? '#00967d' : '#5c6b62' },
    { label: 'Days This Month', value: myMonthDays, icon: '📅', color: '#4a90d9' },
    { label: 'Pending Leaves', value: myPendingLeaves, icon: '📝', color: '#d4a017' },
    { label: 'Approved Leaves', value: myApprovedLeaves, icon: '✅', color: '#00967d' },
  ]

  function handleTabClick(key) {
    if (key === 'chat') {
      setChatOpen(true)
    } else {
      setActiveTab(key)
      setChatOpen(false)
    }
  }

  return (
    <div className="dashboard">
      <nav className="tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`tab ${(chatOpen ? t.key === 'chat' : activeTab === t.key) ? 'tab-active' : ''}`}
            onClick={() => handleTabClick(t.key)}
          >
            {t.label}
            {t.key === 'chat' && unread > 0 && (
              <span className="wa-tab-badge">{unread}</span>
            )}
          </button>
        ))}
      </nav>

      {!chatOpen && <StatCards cards={statCards} />}

      {chatOpen ? (
        <ChatScreen
          chatId={currentUser.id}
          title="Admin"
          photo={adminUser?.photo}
          onBack={() => setChatOpen(false)}
        />
      ) : (
        <div className="tab-content">
          {activeTab === 'profile' && <Profile />}
          {activeTab === 'mark' && <AttendenceForm />}
          {activeTab === 'myAttendance' && <AttendenceList mode="own" />}
          {activeTab === 'applyLeave' && <LeaveForm />}
          {activeTab === 'myLeaves' && <LeaveList mode="own" />}
        </div>
      )}

      {!chatOpen && <ChatBot />}
    </div>
  )
}