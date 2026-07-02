import { useState, useEffect, useRef } from 'react'
import { useApp } from '../AppContext'
import AttendenceForm from './AttendenceForm'
import AttendenceList from './AttendenceList'
import LeaveForm from './LeaveForm'
import LeaveList from './LeaveList'
import ChatScreen from './ChatScreen'
import ChatBot from './ChatBot'
import Profile from './Profile'

const TABS = [
  { key: 'mark', label: 'Mark Attendance' },
  { key: 'myAttendance', label: 'My Attendance' },
  { key: 'applyLeave', label: 'Apply Leave' },
  { key: 'myLeaves', label: 'My Leaves' },
  { key: 'chat', label: 'Chat' },
]

export default function UserDashboard() {
  const { currentUser, messages, profileTrigger } = useApp()
  const [activeTab, setActiveTab] = useState('mark')
  const [chatOpen, setChatOpen] = useState(false)


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

  function handleTabClick(key) {
    if (key === 'chat') {
      setChatOpen(true)
    } else {
      setActiveTab(key)
    }
  }

  return (
    <div className="dashboard">
      <nav className="tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`tab ${activeTab === t.key && t.key !== 'chat' ? 'tab-active' : ''}`}
            onClick={() => handleTabClick(t.key)}
          >
            {t.label}
            {t.key === 'chat' && unread > 0 && (
              <span className="wa-tab-badge">{unread}</span>
            )}
          </button>
        ))}
      </nav>

      <div className="tab-content">
        {activeTab === 'profile' && <Profile />}
        {activeTab === 'mark' && <AttendenceForm />}
        {activeTab === 'myAttendance' && <AttendenceList mode="own" />}
        {activeTab === 'applyLeave' && <LeaveForm />}
        {activeTab === 'myLeaves' && <LeaveList mode="own" />}
      </div>

      {chatOpen ? (
        <ChatScreen
          chatId={currentUser.id}
          title="Admin"
          onBack={() => setChatOpen(false)}
        />
      ) : (
        <ChatBot />
      )}
    </div>
  )
}