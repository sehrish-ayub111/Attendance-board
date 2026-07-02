import { useState } from 'react'
import { useApp } from '../AppContext'

export default function AdminChat() {
  const { users, messages } = useApp()
  const [selectedId, setSelectedId] = useState(null)
  const [search, setSearch] = useState('')

  
  const employees = users.filter((u) => u.role === 'user')


  const filteredEmployees = employees.filter((u) =>
       (u.username || u.name || u.fullName)   
      .toLowerCase()
      .includes(search.toLowerCase())
  )
   console.log("Users:", users)
  console.log("Search:", search)
  console.log("Filtered Employees:", filteredEmployees)

    return (
    <div className="wa-layout">
      <div className="wa-sidebar">
        <div className="wa-sidebar-header">Chats</div>

        <div className="wa-search">
          <input
            type="text"
            placeholder="Search chats..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        
        <div className="wa-user-list">
          {filteredEmployees.map((u) => (
            <button
              key={u.id}
              className={`wa-user ${selectedId === u.id ? 'active' : ''}`}
              onClick={() => setSelectedId(u.id)}
            >
              {u.username || u.name || u.fullName}
              {u.unread > 0 && (
                <span className="wa-user-badge">{u.unread}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="wa-chat-area">
        {selectedId ? (
          <div>
            Chat with {filteredEmployees.find((u) => u.id === selectedId)?.username || u.name || u.fullName}
          </div>
        ) : (
          <div>Select a user to chat</div>
        )}
      </div>
    </div>
  )
}
