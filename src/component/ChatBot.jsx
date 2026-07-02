import { useState, useRef, useEffect } from 'react'
import { useApp } from '../AppContext'

const QUICK_REPLIES = [
  { label: "Today's attendance", query: 'attendance' },
  { label: 'My leaves', query: 'leaves' },
  { label: 'How to apply leave', query: 'apply leave' },
  { label: 'Help', query: 'help' },
]

function formatTime(ts) {
  if (!ts) return '--'
  return new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}


function getBotReply(rawText, ctx) {
  const { currentUser, attendanceRecords, leaveRecords, todayStr } = ctx
  const text = rawText.trim().toLowerCase()

  if (/^(hi|hello|hey|salam|assalam)/.test(text)) {
    return `Hi ${currentUser.name}! I can help you with questions related to your attendance and leaves. Type "help" to see all commands.`
  }

  if (text.includes('help')) {
    return 'You can ask:\n• "attendance" — today\'s status\n• "leaves" — leave summary\n• "apply leave" — how to apply for leave'
  }

  if (text.includes('attendance') || text.includes('checkin') || text.includes('check in') || text.includes('clock')) {
    const today = todayStr()
    const record = attendanceRecords
      .filter((r) => r.userId === currentUser.id && r.date === today)
      .sort((a, b) => b.timeInTs - a.timeInTs)[0]

    if (!record) {
      return 'You haven\'t clocked in yet today. You can clock in from the "Mark Attendance" tab.'
    }
    if (!record.timeOutTs) {
      return `You're currently clocked in. Clock in time: ${formatTime(record.timeInTs)}${record.late ? ' (Late)' : ''}. You haven't clocked out yet.`
    }
    return `Today's record: Clock in ${formatTime(record.timeInTs)}, Clock out ${formatTime(record.timeOutTs)}${record.late ? ' — you were late' : ''}.`
  }

  if (text.includes('leave')) {
    if (text.includes('apply') || text.includes('how')) {
      return 'Go to the "Apply Leave" tab, select the start date, number of days, and type, then write a reason — as soon as you submit, the request will be sent to the admin.'
    }

    const myLeaves = leaveRecords.filter((l) => l.userId === currentUser.id)
    if (myLeaves.length === 0) {
      return 'You haven\'t made any leave requests yet.'
    }
    const pending = myLeaves.filter((l) => l.status === 'pending')
    const approved = myLeaves.filter((l) => l.status === 'approved')
    const rejected = myLeaves.filter((l) => l.status === 'rejected')

    const approvedDays = approved.reduce((sum, l) => sum + Number(l.days || 0), 0)
    const pendingDays = pending.reduce((sum, l) => sum + Number(l.days || 0), 0)

    return `Your leave summary:\n• Approved: ${approved.length} request(s), ${approvedDays} day(s)\n• Pending: ${pending.length} request(s), ${pendingDays} day(s)\n• Rejected: ${rejected.length} request(s)`
  }

  return 'Sorry, I didn\'t understand that. Type "help" to see what I can do, or ask the Admin directly in chat.'
}

export default function ChatBot() {
  const app = useApp()
  const { currentUser } = app
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [thread, setThread] = useState([
    { from: 'bot', text: `Hi ${currentUser.name}! I'm your attendance assistant. Type "help" to see what I can do.` },
  ])
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [thread, open])

  function send(text) {
    if (!text.trim()) return
    const reply = getBotReply(text, app)
    setThread((t) => [...t, { from: 'user', text }, { from: 'bot', text: reply }])
    setInput('')
  }

  function handleSubmit(e) {
    e.preventDefault()
    send(input)
  }

   return (
    <>
      <button className="bot-fab" onClick={() => setOpen((o) => !o)} aria-label="Chatbot">
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="34" height="34" viewBox="0 0 64 64" fill="none">
            <defs>
              <radialGradient id="botEyeGlow" cx="35%" cy="35%" r="70%">
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
            <rect x="11" y="13" width="42" height="38" rx="16" fill="url(#botEyeGlow)" opacity="0.06" />

          
            <rect x="17" y="22" width="30" height="19" rx="8" fill="#16324a" />

            
            <circle cx="26.5" cy="31.5" r="4.4" fill="url(#botEyeGlow)" />
            <circle cx="37.5" cy="31.5" r="4.4" fill="url(#botEyeGlow)" />

          
            <path d="M26 46c2.2 2 9.8 2 12 0" stroke="#c9d2d8" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        )}
      </button>

      {open && (
        <div className="bot-panel">
          <div className="bot-header">
            <span>Attendance Assistant</span>
          </div>

          <div className="bot-body">
            {thread.map((m, i) => (
              <div key={i} className={`bot-msg bot-msg-${m.from}`}>
                {m.text}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <div className="bot-quick-replies">
            {QUICK_REPLIES.map((q) => (
              <button key={q.query} type="button" className="bot-quick-btn" onClick={() => send(q.query)}>
                {q.label}
              </button>
            ))}
          </div>

          <form className="bot-input-row" onSubmit={handleSubmit}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Question..."
            />
            <button type="submit" className="btn btn-primary">Send</button>
          </form>
        </div>
      )}
    </>
  )
}
