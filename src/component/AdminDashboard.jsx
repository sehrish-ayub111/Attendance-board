import { useState, useEffect, useRef } from 'react'
import { useApp } from '../AppContext'
import AttendenceList from './AttendenceList'
import LeaveList from './LeaveList'
import AddEmployee from './Addemployee'
import ChatScreen from './ChatScreen'
import AdminChatBot from './AdminChatBot'
import Profile from './Profile'
import StatCards from './StatCards'
import EmployeeProfileModal from './EmployeeProfileModal'

// Top navigation tabs shown in the admin dashboard
const TABS = [
  { key: 'attendance', label: 'All Attendance' },
  { key: 'leaves', label: 'All Leave Requests' },
  { key: 'addEmployee', label: 'Employee' },
  { key: 'chat', label: 'Chat' },
]

export default function AdminDashboard() {
  // Pull shared app data and "trigger" counters from global context.
  // pendingLeavesTrigger/profileTrigger increment elsewhere in the app to
  // signal "something happened, auto-switch the tab" (e.g. new leave request submitted)
  const { pendingLeavesTrigger, profileTrigger, users, messages, attendanceRecords, leaveRecords, todayStr } = useApp()

  const [activeTab, setActiveTab] = useState('attendance') // currently selected tab
  const [chatTarget, setChatTarget] = useState(null) // employee whose chat is currently open (null = no chat open)
  const [chatSearch, setChatSearch] = useState('') // search text for filtering employees in the Chat tab
  const [profileModalUser, setProfileModalUser] = useState(null) // employee whose profile modal is open (from chat header click)

  // Store the trigger values at mount time so we can detect when they *increase*
  // (i.e. a new event happened), rather than reacting on every render
  const pendingBaseline = useRef(pendingLeavesTrigger)
  const profileBaseline = useRef(profileTrigger)

  // If a new leave request comes in (trigger increases), auto-switch to the "leaves" tab
  useEffect(() => {
    if (pendingLeavesTrigger > pendingBaseline.current) setActiveTab('leaves')
  }, [pendingLeavesTrigger])

  // If profile trigger increases (e.g. someone requests to view a profile), 
  // switch to the profile tab and close any open chat
  useEffect(() => {
    if (profileTrigger > profileBaseline.current) {
      setActiveTab('profile')
      setChatTarget(null)
    }
  }, [profileTrigger])

  // Only regular employees (not admins) are relevant here
  const employees = users.filter((u) => u.role === 'user')

  // Employees filtered by the chat search box text
  const visibleEmployees = employees.filter((u) =>
    u.name.toLowerCase().includes(chatSearch.trim().toLowerCase())
  )

  // Counts unread messages (not yet read by admin) for a given employee
  function unreadFor(empId) {
    return messages.filter((m) => m.chatId === empId && !m.readByAdmin).length
  }

  // Total unread messages across all employees, shown as a badge on the Chat tab
  const totalUnread = employees.reduce((sum, u) => sum + unreadFor(u.id), 0)

  // --- Stats for the dashboard summary cards ---
  const today = todayStr()
  const todayRecords = attendanceRecords.filter((r) => r.date === today)
  const presentIds = new Set(todayRecords.map((r) => r.userId)) // unique employees who checked in today
  const presentCount = presentIds.size
  const absentCount = Math.max(employees.length - presentCount, 0) // avoid negative numbers
  const pendingLeavesCount = leaveRecords.filter((l) => l.status === 'pending').length

  // Data for the 4 stat cards shown at the top of the dashboard
  const statCards = [
    { label: 'Present Today', value: presentCount, icon: '✅', color: '#00967d' },
    { label: 'Absent Today', value: absentCount, icon: '🚫', color: '#c0524a' },
    { label: 'Pending Leaves', value: pendingLeavesCount, icon: '📝', color: '#d4a017' },
    { label: 'Total Employees', value: employees.length, icon: '👥', color: '#4a90d9' },
  ]

  return (
    <div className="dashboard">
      {/* Top tab navigation bar */}
      <nav className="tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            // Highlight "chat" tab if a chat is open, otherwise highlight based on activeTab
            className={`tab ${(chatTarget ? t.key === 'chat' : activeTab === t.key) ? 'tab-active' : ''}`}
            onClick={() => {
              setActiveTab(t.key)
              setChatTarget(null) // switching tabs closes any open individual chat
            }}
          >
            {t.label}
            {/* Show unread message count badge only on the Chat tab */}
            {t.key === 'chat' && totalUnread > 0 && (
              <span className="wa-tab-badge">{totalUnread}</span>
            )}
          </button>
        ))}
      </nav>

      {/* Hide the stat cards while a 1-on-1 chat is open, to give more space */}
      {!chatTarget && <StatCards cards={statCards} />}

      {chatTarget ? (
        // If an employee chat is open, show the full chat screen instead of tab content
        <ChatScreen
          chatId={chatTarget.id}
          title={chatTarget.name}
          photo={chatTarget.photo}
          onBack={() => setChatTarget(null)} // close chat, return to list
          onTitleClick={() => {
            // Clicking the chat header opens that employee's profile modal
            const emp = employees.find((u) => u.id === chatTarget.id)
            if (emp) setProfileModalUser(emp)
          }}
        />
      ) : (
        // Otherwise, render whichever tab is currently active
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

              {/* Only show the search box if there's at least one employee */}
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

              {/* Empty states: no employees at all vs. no results matching search */}
              {employees.length === 0 ? (
                <p className="empty-state">empty</p>
              ) : visibleEmployees.length === 0 ? (
                <p className="empty-state">empty.</p>
              ) : (
                // List of employees available to chat with
                <div className="wa-list">
                  {visibleEmployees.map((u) => {
                    const unread = unreadFor(u.id)
                    // Get the most recent message with this employee (for preview text)
                    const lastMsg = messages
                      .filter((m) => m.chatId === u.id)
                      .sort((a, b) => b.timestamp - a.timestamp)[0]
                    return (
                      <button
                        key={u.id}
                        className="wa-list-item"
                        onClick={() => setChatTarget({ id: u.id, name: u.name, photo: u.photo })} // open this employee's chat
                      >
                        <div className="wa-list-avatar">
                          {/* Show photo if available, otherwise fall back to first letter of name */}
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
                        {/* Unread badge, shown only if there are unread messages */}
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

      {/* Floating AI chatbot, hidden while an individual chat is open */}
      {!chatTarget && <AdminChatBot />}

      {/* Employee profile modal, shown when triggered from the chat header */}
      {profileModalUser && (
        <EmployeeProfileModal
          user={profileModalUser}
          onClose={() => setProfileModalUser(null)}
        />
      )}
    </div>
  )
}