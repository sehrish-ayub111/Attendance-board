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

// Tabs available to a regular employee in their dashboard
const TABS = [
  { key: 'mark', label: 'Mark Attendance' },
  { key: 'myAttendance', label: 'My Attendance' },
  { key: 'applyLeave', label: 'Apply Leave' },
  { key: 'myLeaves', label: 'My Leaves' },
  { key: 'chat', label: 'Chat' },
]

// Employee-facing counterpart to AdminDashboard — shows the employee's own
// attendance/leave tools, plus a chat with the admin
export default function UserDashboard() {
  const { currentUser, messages, profileTrigger, users, attendanceRecords, leaveRecords, todayStr } = useApp()
  const [activeTab, setActiveTab] = useState('mark') // currently selected tab
  const [chatOpen, setChatOpen] = useState(false) // whether the chat-with-admin screen is open

  // Find the admin user, used to show their name/photo in the chat header
  const adminUser = users.find((u) => u.role === 'admin')

  // Store the initial profileTrigger value so we can detect when it *increases*
  // (i.e. something externally requested the profile tab be opened)
  const profileBaseline = useRef(profileTrigger)

  // If profileTrigger increases, auto-switch to the profile tab and close chat
  useEffect(() => {
    if (profileTrigger > profileBaseline.current) {
      setActiveTab('profile')
      setChatOpen(false)
    }
  }, [profileTrigger])

  // Count of unread messages from the admin (not yet read by this employee)
  const unread = messages.filter(
    (m) => m.chatId === currentUser.id && !m.readByEmployee
  ).length

  // --- Stats for this employee's summary cards ---
  const monthKey = todayStr().slice(0, 7) // current month, "YYYY-MM"
  const myAttendance = attendanceRecords.filter((r) => r.userId === currentUser.id)

  // Count of unique days attended this month
  const myMonthDays = new Set(
    myAttendance.filter((r) => r.date && r.date.startsWith(monthKey)).map((r) => r.date)
  ).size

  // Whether the employee currently has an open (not clocked out) record for today
  const isClockedInToday = myAttendance.some((r) => r.date === todayStr() && !r.timeOutTs)

  const myLeaves = leaveRecords.filter((l) => l.userId === currentUser.id)
  const myPendingLeaves = myLeaves.filter((l) => l.status === 'pending').length
  const myApprovedLeaves = myLeaves.filter((l) => l.status === 'approved').length

  // Data for the 4 stat cards shown at the top of the dashboard
  const statCards = [
    { label: "Today's Status", value: isClockedInToday ? 'Clocked In' : 'Not In', icon: '🕒', color: isClockedInToday ? '#00967d' : '#5c6b62' },
    { label: 'Days This Month', value: myMonthDays, icon: '📅', color: '#4a90d9' },
    { label: 'Pending Leaves', value: myPendingLeaves, icon: '📝', color: '#d4a017' },
    { label: 'Approved Leaves', value: myApprovedLeaves, icon: '✅', color: '#00967d' },
  ]

  // Handles tab clicks: "chat" opens the chat screen, any other tab switches
  // the active tab and makes sure chat is closed
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
      {/* Top tab navigation */}
      <nav className="tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            // Highlight "chat" tab if chat is open, otherwise highlight based on activeTab
            className={`tab ${(chatOpen ? t.key === 'chat' : activeTab === t.key) ? 'tab-active' : ''}`}
            onClick={() => handleTabClick(t.key)}
          >
            {t.label}
            {/* Unread message badge, shown only on the Chat tab */}
            {t.key === 'chat' && unread > 0 && (
              <span className="wa-tab-badge">{unread}</span>
            )}
          </button>
        ))}
      </nav>

      {/* Hide stat cards while chat is open, to give the chat more space */}
      {!chatOpen && <StatCards cards={statCards} />}

      {chatOpen ? (
        // Chat screen with the admin (chatId uses the employee's own ID as the conversation key)
        <ChatScreen
          chatId={currentUser.id}
          title="Admin"
          photo={adminUser?.photo}
          onBack={() => setChatOpen(false)}
        />
      ) : (
        // Otherwise, render whichever tab is currently active
        <div className="tab-content">
          {activeTab === 'profile' && <Profile />}
          {activeTab === 'mark' && <AttendenceForm />}
          {activeTab === 'myAttendance' && <AttendenceList mode="own" />}
          {activeTab === 'applyLeave' && <LeaveForm />}
          {activeTab === 'myLeaves' && <LeaveList mode="own" />}
        </div>
      )}

      {/* Floating AI chatbot, hidden while the admin chat is open */}
      {!chatOpen && <ChatBot />}
    </div>
  )
}