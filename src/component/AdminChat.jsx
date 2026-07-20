import { useState } from 'react'
import { useApp } from '../AppContext'
import ChatScreen from './ChatScreen'

// Generates a consistent avatar background color based on the first letter of the name
function avatarColor(name) {
  const colors = [
    '#2f6b4f', '#e0883b', '#4a90d9', '#7b5ea7',
    '#c0524a', '#3c8b5d', '#d4a017', '#5c8a8a',
  ]
  // Use char code of first letter to pick a color from the array (same name -> same color)
  return colors[(name?.charCodeAt(0) || 0) % colors.length]
}

export default function AdminChat() {
  // Get all users and messages from global app context
  const { users, messages } = useApp()

  // Currently selected employee's chat (null = show list view)
  const [selectedId, setSelectedId] = useState(null)

  // Search input value for filtering employee list
  const [search, setSearch] = useState('')

  // Only keep users with role "user" (exclude admins etc.)
  const employees = users.filter((u) => u.role === 'user')

  // Filter employees based on search text (matches name or username, case-insensitive)
  const filteredEmployees = employees.filter((u) =>
    (u.name || u.username || '')
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  // If an employee is selected, show their individual chat screen instead of the list
  if (selectedId) {
    const selectedEmployee = employees.find((u) => u.id === selectedId)
    return (
      <ChatScreen
        chatId={selectedId}
        title={selectedEmployee?.name || selectedEmployee?.username || 'Employee'}
        onBack={() => setSelectedId(null)} // Go back to employee list
      />
    )
  }

  // Employee list view (default view)
  return (
    <div className="wa-list-card">
      {/* Header section */}
      <div className="wa-list-header">
        <h2>Chats</h2>
      </div>

      {/* Search box to filter employees */}
      <div className="wa-search-box">
        <input
          type="text"
          placeholder="Search chats..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Show empty state if no employee matches the search */}
      {filteredEmployees.length === 0 ? (
        <p className="empty-state" style={{ padding: '20px' }}>
          Koi employee nahi mila.
        </p>
      ) : (
        <div className="wa-list">
          {filteredEmployees.map((u) => {
            const name = u.name || u.username || 'Employee'

            // Count unread messages sent by this employee that admin hasn't read yet
            const unread = messages.filter(
              (m) => m.chatId === u.id && !m.readByAdmin
            ).length

            // Get the most recent message for this employee (sorted by timestamp, latest first)
            const lastMsg = messages
              .filter((m) => m.chatId === u.id)
              .sort((a, b) => b.timestamp - a.timestamp)[0]

            return (
              <button
                key={u.id}
                className="wa-contact"
                onClick={() => setSelectedId(u.id)} // Open this employee's chat on click
              >
               
                {/* Avatar circle with first letter of name */}
                <div
                  className="wa-avatar"
                  style={{ background: avatarColor(name) }}
                >
                  {name.charAt(0).toUpperCase()}
                </div>

                <div className="wa-contact-info">
                  <div className="wa-contact-top">
                    <span className="wa-contact-name">{name}</span>
                    {/* Show unread badge only if there are unread messages */}
                    {unread > 0 && (
                      <span className="wa-unread-badge">{unread}</span>
                    )}
                  </div>
                  {/* Show preview of the last message, or fallback text */}
                  <span className="wa-last-msg">
                    {lastMsg?.text || 'No messages yet'}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}