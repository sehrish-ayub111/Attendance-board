import { useState, useEffect, useRef } from 'react'
import { useApp } from '../AppContext'
import AttendenceList from './AttendenceList'
import LeaveList from './LeaveList'
import AddEmployee from './Addemployee'
import ChatScreen from './ChatScreen'
import AdminChatBot from "./Adminchatbot"
import Profile from './Profile'
import StatCards from './StatCards'
import EmployeeProfileModal from './EmployeeProfileModal'

const TABS = [
  { key: 'attendance', label: 'All Attendance' },
  { key: 'leaves', label: 'All Leave Requests' },
  { key: 'addEmployee', label: 'Employee' },
  { key: 'chat', label: 'Chat' },
]

export default function AdminDashboard() {
  const { pendingLeavesTrigger, profileTrigger, users, messages, attendanceRecords, leaveRecords, todayStr } = useApp()
  const [activeTab, setActiveTab] = useState('attendance')
  const [chatTarget, setChatTarget] = useState(null) 
  const [chatSearch, setChatSearch] = useState('')
  const [profileModalUser, setProfileModalUser] = useState(null)

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


  const today = todayStr()
  const todayRecords = attendanceRecords.filter((r) => r.date === today)
  const presentIds = new Set(todayRecords.map((r) => r.userId))
  const presentCount = presentIds.size
  const absentCount = Math.max(employees.length - presentCount, 0)
  const pendingLeavesCount = leaveRecords.filter((l) => l.status === 'pending').length

  const statCards = [
    { label: 'Present Today', value: presentCount, icon: '✅', color: '#00967d' },
    { label: 'Absent Today', value: absentCount, icon: '🚫', color: '#c0524a' },
    { label: 'Pending Leaves', value: pendingLeavesCount, icon: '📝', color: '#d4a017' },
    { label: 'Total Employees', value: employees.length, icon: '👥', color: '#4a90d9' },
  ]

  return (
    <div className="dashboard">
      <nav className="tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`tab ${(chatTarget ? t.key === 'chat' : activeTab === t.key) ? 'tab-active' : ''}`}
            onClick={() => {
              setActiveTab(t.key)
              setChatTarget(null)
            }}
          >
            {t.label}
            {t.key === 'chat' && totalUnread > 0 && (
              <span className="wa-tab-badge">{totalUnread}</span>
            )}
          </button>
        ))}
      </nav>

      {!chatTarget && <StatCards cards={statCards} />}

      {chatTarget ? (
        <ChatScreen
          chatId={chatTarget.id}
          title={chatTarget.name}
          photo={chatTarget.photo}
          onBack={() => setChatTarget(null)}
          onTitleClick={() => {
            const emp = employees.find((u) => u.id === chatTarget.id)
            if (emp) setProfileModalUser(emp)
          }}
        />
      ) : (
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
                        onClick={() => setChatTarget({ id: u.id, name: u.name, photo: u.photo })}
                      >
                        <div className="wa-list-avatar">
                          {u.photo ? (
                            <img src={u.photo} alt={u.name} className="wa-list-avatar-img" />
                          ) : (
                            u.name[0].toUpperCase()
                          )}
                        </div>
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
      )}

      {!chatTarget && <AdminChatBot />}

      {profileModalUser && (
        <EmployeeProfileModal
          user={profileModalUser}
          onClose={() => setProfileModalUser(null)}
        />
      )}
    </div>
  )
}
