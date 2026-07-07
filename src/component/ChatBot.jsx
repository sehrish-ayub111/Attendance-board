import { useState, useRef, useEffect } from 'react'
import { useApp } from '../AppContext'
import { askGemini } from '../geminiClient'

const QUICK_REPLIES = [
  "What's my attendance today?",
  "Tell me my leaves status",
  "How do I apply for leave?",
  "How many times was I late this month?",
]

function formatTime(ts) {
  if (!ts) return 'Not recorded'
  return new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

function buildContext({ currentUser, attendanceRecords, leaveRecords, todayStr }) {
  const today = todayStr()
  const myAttendance = attendanceRecords
    .filter((r) => r.userId === currentUser.id)
    .sort((a, b) => b.timeInTs - a.timeInTs)

  const myLeaves = leaveRecords.filter((l) => l.userId === currentUser.id)

  const todayRecord = myAttendance.find((r) => r.date === today)
  const lateCount = myAttendance.filter((r) => r.late).length
  const currentMonthKey = today.slice(0, 7)
  const thisMonthAttendance = myAttendance.filter((r) => r.date?.startsWith(currentMonthKey))
  const thisMonthLate = thisMonthAttendance.filter((r) => r.late).length

  const pendingLeaves = myLeaves.filter((l) => l.status === 'pending')
  const approvedLeaves = myLeaves.filter((l) => l.status === 'approved')
  const rejectedLeaves = myLeaves.filter((l) => l.status === 'rejected')

  const allAttendanceText = myAttendance
    .map((r) => `  - ${r.date}: Clock In ${formatTime(r.timeInTs)}, Clock Out ${formatTime(r.timeOutTs)}${r.late ? ' ⚠ LATE' : ''}`)
    .join('\n')

  const allLeavesText = myLeaves
    .map((l) => `  - From ${l.startDate} to ${l.endDate} (${l.days} day/s), Type: ${l.type}, Status: ${l.status.toUpperCase()}, Reason: ${l.reason || '—'}`)
    .join('\n')

  return `You are a smart, helpful AI attendance assistant for employee "${currentUser.name}".
Today's date: ${today}.

IMPORTANT RULES:
1. You have FULL ACCESS to all of this employee's data. NEVER say "I don't have access" or "I can't provide this information" or "information is not available". Always give a direct answer.
2. If the employee asks about "today", "this week", "this month" — calculate it from the data below.
3. If the employee asks "who", "what", "where", "how", "name", "they" — answer from the data below.
4. Always be friendly and give useful, specific answers with actual numbers and dates.
5. If there is no data for something, say "No records found" and suggest what they should do.

APP NAVIGATION GUIDE:
- Clock In/Out → "Mark Attendance" tab
- Apply for leave → "Apply Leave" tab (select date, days, type, reason, submit)
- View leave status → "My Leaves" tab
- Chat with admin → "Chat" tab
- Edit profile → click avatar circle in top navbar

EMPLOYEE SUMMARY:
- Name: ${currentUser.name}
- Total attendance records: ${myAttendance.length}
- Total late count (all time): ${lateCount}
- This month (${currentMonthKey}) attendance: ${thisMonthAttendance.length} day(s), Late: ${thisMonthLate} time(s)
- Today's status: ${todayRecord ? `Clocked in at ${formatTime(todayRecord.timeInTs)}, Clocked out at ${formatTime(todayRecord.timeOutTs)}${todayRecord.late ? ' (LATE)' : ''}` : 'Not clocked in yet today'}
- Total leave requests: ${myLeaves.length} (Pending: ${pendingLeaves.length}, Approved: ${approvedLeaves.length}, Rejected: ${rejectedLeaves.length})

ALL ATTENDANCE RECORDS (newest first):
${allAttendanceText || '  No attendance records found.'}

ALL LEAVE REQUESTS:
${allLeavesText || '  No leave requests found.'}`
}

export default function ChatBot() {
  const app = useApp()
  const { currentUser } = app
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [thread, setThread] = useState([
    { from: 'bot', text: `Hi ${currentUser.name}! I'm your AI attendance assistant. Ask me anything about your attendance, leaves, or how to use the app!` },
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
      setThread((t) => [...t, { from: 'bot', text: `Sorry, something went wrong. Please try again. (${err.message})` }])
    }
    setLoading(false)
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
            <span>AI Attendance Assistant</span>
          </div>
          <div className="bot-body">
            {thread.map((m, i) => (
              <div key={i} className={`bot-msg bot-msg-${m.from}`}>{m.text}</div>
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
              <button key={q} type="button" className="bot-quick-btn" onClick={() => send(q)} disabled={loading}>{q}</button>
            ))}
          </div>
          <form className="bot-input-row" onSubmit={handleSubmit}>
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask me anything..." disabled={loading} />
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? '...' : 'Send'}</button>
          </form>
        </div>
      )}
    </>
  )
}
