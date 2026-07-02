import { useState, useEffect, useRef } from 'react'
import { useApp } from '../AppContext'
import AttendenceList from './AttendenceList'
import LeaveList from './LeaveList'
import AddEmployee from './Addemployee'
import ChatScreen from './ChatScreen'
import AdminChatBot from './AdminChatBot'
import Profile from './Profile'

const TABS = [
  { key: 'attendance', label: 'All Attendance' },
  { key: 'leaves', label: 'All Leave Requests' },
  { key: 'addEmployee', label: 'Add Employee' },
  { key: 'chat', label: 'Chat' },
]

export default function AdminDashboard() {
  const { pendingLeavesTrigger, profileTrigger, users, messages } = useApp()
  const [activeTab, setActiveTab] = useState('attendance')
  const [chatTarget, setChatTarget] = useState(null) 
  const [chatSearch, setChatSearch] = useState('')

  
  const pendingBaseline = useRef(pendingLeavesTrigger)
  const profileBaseline = useRef(profileTrigger)

  useEffect(() => {
    if (pendingLeavesTrigger > pendingBaseline.current) setActiveTab('leaves')
  }, [pendingLeavesTrigger])

  useEffect(() => {
    if (profileTrigger > profileBaseline.current) {
      setActiveTab('profile')
      setChatTarget(null)
    }
  }, [profileTrigger])

  const employees = users.filter((u) => u.role === 'user')

  const visibleEmployees = employees.filter((u) =>
    u.name.toLowerCase().includes(chatSearch.trim().toLowerCase())
  )

  function unreadFor(empId) {
    return messages.filter((m) => m.chatId === empId && !m.readByAdmin).length
  }

  const totalUnread = employees.reduce((sum, u) => sum + unreadFor(u.id), 0)

  return (
    <div className="dashboard">
      <nav className="tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`tab ${activeTab === t.key ? 'tab-active' : ''}`}
            onClick={() => setActiveTab(t.key)}
          >
            {t.label}
            {t.key === 'chat' && totalUnread > 0 && (
              <span className="wa-tab-badge">{totalUnread}</span>
            )}
          </button>
        ))}
      </nav>

      <div className="tab-content">
        {activeTab === 'profile' && <Profile />}
        {activeTab === 'attendance' && <AttendenceList mode="admin" />}
        {activeTab === 'leaves' && (
          <LeaveList mode="admin" pendingTrigger={pendingLeavesTrigger} />
        )}
        {activeTab === 'addEmployee' && <AddEmployee />}
        {activeTab === 'chat' && (
          <div className="card">
            <h2 className="card-title">Chat</h2>

            {employees.length > 0 && (
              <div className="wa-search-box">
                <input
                  type="text"
                  className="wa-search-input"
                  placeholder="Employee search..."
                  value={chatSearch}
                  onChange={(e) => setChatSearch(e.target.value)}
                />
              </div>
            )}

            {employees.length === 0 ? (
              <p className="empty-state">empty</p>
            ) : visibleEmployees.length === 0 ? (
              <p className="empty-state">empty.</p>
            ) : (
              <div className="wa-list">
                {visibleEmployees.map((u) => {
                  const unread = unreadFor(u.id)
                  const lastMsg = messages
                    .filter((m) => m.chatId === u.id)
                    .sort((a, b) => b.timestamp - a.timestamp)[0]
                  return (
                    <button
                      key={u.id}
                      className="wa-list-item"
                      onClick={() => setChatTarget({ id: u.id, name: u.name })}
                    >
                      <div className="wa-list-avatar">{u.name[0].toUpperCase()}</div>
                      <div className="wa-list-info">
                        <span className="wa-list-name">{u.name}</span>
                        <span className="wa-list-preview">
                          {lastMsg ? lastMsg.text : 'No messages yet'}
                        </span>
                      </div>
                      {unread > 0 && (
                        <span className="wa-unread-badge">{unread}</span>
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>

   
      {chatTarget ? (
        <ChatScreen
          chatId={chatTarget.id}
          title={chatTarget.name}
          onBack={() => setChatTarget(null)}
        />
      ) : (
        <AdminChatBot />
      )}
    </div>
  )
}