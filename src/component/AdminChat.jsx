import { useState } from 'react'
import { useApp } from '../AppContext'
import ChatScreen from './ChatScreen'

// Avatar color — naam ke pehle letter se consistent color
function avatarColor(name) {
  const colors = [
    '#2f6b4f', '#e0883b', '#4a90d9', '#7b5ea7',
    '#c0524a', '#3c8b5d', '#d4a017', '#5c8a8a',
  ]
  return colors[(name?.charCodeAt(0) || 0) % colors.length]
}

export default function AdminChat() {
  const { users, messages } = useApp()
  const [selectedId, setSelectedId] = useState(null)
  const [search, setSearch] = useState('')

  const employees = users.filter((u) => u.role === 'user')

  const filteredEmployees = employees.filter((u) =>
    (u.name || u.username || '')
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  // Agar employee select ho gaya to ChatScreen dikhao
  if (selectedId) {
    const selectedEmployee = employees.find((u) => u.id === selectedId)
    return (
      <ChatScreen
        chatId={selectedId}
        title={selectedEmployee?.name || selectedEmployee?.username || 'Employee'}
        onBack={() => setSelectedId(null)}
      />
    )
  }

  // Employee list
  return (
    <div className="wa-list-card">
      <div className="wa-list-header">
        <h2>Chats</h2>
      </div>

      <div className="wa-search-box">
        <input
          type="text"
          placeholder="Search chats..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filteredEmployees.length === 0 ? (
        <p className="empty-state" style={{ padding: '20px' }}>
          Koi employee nahi mila.
        </p>
      ) : (
        <div className="wa-list">
          {filteredEmployees.map((u) => {
            const name = u.name || u.username || 'Employee'
            const unread = messages.filter(
              (m) => m.chatId === u.id && !m.readByAdmin
            ).length
            const lastMsg = messages
              .filter((m) => m.chatId === u.id)
              .sort((a, b) => b.timestamp - a.timestamp)[0]

            return (
              <button
                key={u.id}
                className="wa-contact"
                onClick={() => setSelectedId(u.id)}
              >
                {/* Avatar with color */}
                <div
                  className="wa-avatar"
                  style={{ background: avatarColor(name) }}
                >
                  {name.charAt(0).toUpperCase()}
                </div>

                <div className="wa-contact-info">
                  <div className="wa-contact-top">
                    <span className="wa-contact-name">{name}</span>
                    {unread > 0 && (
                      <span className="wa-unread-badge">{unread}</span>
                    )}
                  </div>
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
