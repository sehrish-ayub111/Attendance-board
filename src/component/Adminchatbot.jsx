import { useState, useRef, useEffect } from 'react'
import { useApp } from '../AppContext'
import { askGemini } from '../geminiClient'

const QUICK_REPLIES = [
  'How many employees are present today?',
  'Who is absent today?',
  'Show pending leave requests',
  'Who is late the most often?',
]

function formatTime(ts) {
  if (!ts) return '--'
  return new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}


function buildContext({ users, attendanceRecords, leaveRecords, todayStr }) {
  const employees = users.filter((u) => u.role === 'user')
  const today = todayStr()

  const perEmployee = employees
    .map((emp) => {
      const empAttendance = attendanceRecords
        .filter((r) => r.userId === emp.id)
        .sort((a, b) => b.timeInTs - a.timeInTs)
        .slice(0, 15)
        .map((r) => `    ${r.date}: in ${formatTime(r.timeInTs)}, out ${formatTime(r.timeOutTs)}${r.late ? ' (Late)' : ''}`)
        .join('\n')

      const empLeaves = leaveRecords
        .filter((l) => l.userId === emp.id)
        .map((l) => `    ${l.startDate}, ${l.days} day(s), ${l.type}, status: ${l.status}`)
        .join('\n')

      return `Employee: ${emp.name} (username: ${emp.username})\n  Attendance (recent 15):\n${empAttendance || '    No records'}\n  Leave requests:\n${empLeaves || '    No leave requests'}`
    })
    .join('\n\n')

  return `You are an AI attendance assistant for the admin, with access to the entire team's attendance/leave data. Today's date: ${today}. Total employees: ${employees.length}.

How this app works (use this to answer "how do I..." questions):
- To view all attendance: "All Attendance" tab. You can filter by Today/Yesterday/Last Week/Last Month, or search by name.
- To approve/reject a leave request: "All Leave Requests" tab.
- To add a new employee: "Employee" tab.
- To chat with an employee: "Chat" tab.
- To edit profile/photo: click the avatar in the top navbar.

${perEmployee}`
}

export default function AdminChatBot() {
  const app = useApp()
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [thread, setThread] = useState([
    { from: 'bot', text: "Hi! I'm your AI admin assistant. Ask me anything about the whole team's attendance/leaves." },
  ])
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [thread, open, loading])

  async function send(text) {
    if (!text.trim() || loading) return
    setThread((t) => [...t, { from: 'user', text }])
    setInput('')
    setLoading(true)

    try {
      const context = buildContext(app)
      const reply = await askGemini(context, text)
      setThread((t) => [...t, { from: 'bot', text: reply }])
    } catch (err) {
      setThread((t) => [...t, { from: 'bot', text: `Sorry, I couldn't get a response. (${err.message})` }])
    }
    setLoading(false)
  }

  function handleSubmit(e) {
    e.preventDefault()
    send(input)
  }

  return (
    <>
      <button className="bot-fab" onClick={() => setOpen((o) => !o)} aria-label="Admin Chatbot">
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="34" height="34" viewBox="0 0 64 64" fill="none">
            <defs>
              <radialGradient id="adminBotEyeGlow" cx="35%" cy="35%" r="70%">
                <stop offset="0%" stopColor="#eafcff" />
                <stop offset="45%" stopColor="#4fd8ff" />
                <stop offset="100%" stopColor="#0ea5e9" />
              </radialGradient>
            </defs>
            <line x1="32" y1="6" x2="32" y2="12" stroke="#e8edf1" strokeWidth="2.4" strokeLinecap="round" />
            <circle cx="32" cy="5" r="2.6" fill="#4fd8ff" />
            <rect x="6" y="26" width="5" height="14" rx="2.5" fill="#c9d2d8" />
            <rect x="53" y="26" width="5" height="14" rx="2.5" fill="#c9d2d8" />
            <rect x="11" y="13" width="42" height="38" rx="16" fill="#f3f6f8" />
            <rect x="11" y="13" width="42" height="38" rx="16" fill="url(#adminBotEyeGlow)" opacity="0.06" />
            <rect x="17" y="22" width="30" height="19" rx="8" fill="#16324a" />
            <circle cx="26.5" cy="31.5" r="4.4" fill="url(#adminBotEyeGlow)" />
            <circle cx="37.5" cy="31.5" r="4.4" fill="url(#adminBotEyeGlow)" />
            <path d="M26 46c2.2 2 9.8 2 12 0" stroke="#c9d2d8" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        )}
      </button>

      {open && (
        <div className="bot-panel">
          <div className="bot-header">
            <span>AI Admin Assistant</span>
          </div>

          <div className="bot-body">
            {thread.map((m, i) => (
              <div key={i} className={`bot-msg bot-msg-${m.from}`}>
                {m.text}
              </div>
            ))}
            {loading && (
              <div className="bot-msg bot-msg-bot bot-msg-typing">
                <span className="bot-typing-dot" />
                <span className="bot-typing-dot" />
                <span className="bot-typing-dot" />
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="bot-quick-replies">
            {QUICK_REPLIES.map((q) => (
              <button key={q} type="button" className="bot-quick-btn" onClick={() => send(q)} disabled={loading}>
                {q}
              </button>
            ))}
          </div>

          <form className="bot-input-row" onSubmit={handleSubmit}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              disabled={loading}
            />
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? '...' : 'Send'}
            </button>
          </form>
        </div>
      )}
    </>
  )
}