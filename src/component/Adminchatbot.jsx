import { useState, useRef, useEffect } from 'react'
import { useApp } from '../AppContext'

const QUICK_REPLIES = [
  { label: 'How much are present', query: 'how mush are present' },
  { label: 'Pending leaves', query: 'pending leaves' },
  { label: 'Total employees', query: 'total employees' },
  { label: 'how much are absent', query:'how much are absent' },
  { label: 'Help', query: 'help' },
]

function formatTime(ts) {
  if (!ts) return '--'
  return new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}


function getBotReply(rawText, ctx) {
  const { users, attendanceRecords, leaveRecords, todayStr } = ctx
  const text = rawText.trim().toLowerCase()
  const employees = users.filter((u) => u.role === 'user')
  const today = todayStr()

  if (/^(hi|hello|hey|salam|assalam)/.test(text)) {
    return 'Hi! I can tell you about the entire teams attendance and leaves. Type "help" to see the commands.'
  }

  if (text.includes('help')) {
    return 'You can ask:\n• "how many present today" — today\'s attendance\n• "who is absent today" — who didn\'t come today\n• "pending leaves" — pending leave requests\n• "total employees" — total employee count\n• Type an employee\'s name (e.g. "sehrish") — their record'
  }

  const matchedEmployee = employees.find((u) =>
    text.includes(u.name.toLowerCase())
  )
  if (matchedEmployee) {
    const record = attendanceRecords
      .filter((r) => r.userId === matchedEmployee.id && r.date === today)
      .sort((a, b) => b.timeInTs - a.timeInTs)[0]

    const myLeaves = leaveRecords.filter((l) => l.userId === matchedEmployee.id)
    const pending = myLeaves.filter((l) => l.status === 'pending').length
    const approved = myLeaves.filter((l) => l.status === 'approved').length

    let attendanceLine
    if (!record) {
      attendanceLine = 'did not clock in today.'
    } else if (!record.timeOutTs) {
      attendanceLine =`Clocked in today: ${formatTime(record.timeInTs)}${record.late ? ' (Late)' : ''}, still clocked in.`
    } else {
      attendanceLine = `Clocked in today ${formatTime(record.timeInTs)}, clock out: ${formatTime(record.timeOutTs)}${record.late ? ' — Late' : ''}.`
    }

    return `${matchedEmployee.name}  record:\n• ${attendanceLine}\n• Leave requests: ${approved} approved, ${pending} pending`
  }

  if (text.includes('absent') || text.includes('not yet') || text.includes('not yet')) {
    const presentIds = new Set(
      attendanceRecords.filter((r) => r.date === today).map((r) => r.userId)
    )
    const absent = employees.filter((u) => !presentIds.has(u.id))
    if (absent.length === 0) return 'Today, all employes are clock in.'
    return`Today ${absent.length} employee(s) have not clocked in:\n${absent.map((u) => `• ${u.name}`).join('\n')}`
  }

  if (text.includes('late')) {
    const lateToday = attendanceRecords.filter((r) => r.date === today && r.late)
    if (lateToday.length === 0) return 'Today all are not  late.'
    return `today ${lateToday.length} employee(s) are late:\n${lateToday.map((r) => `• ${r.userName} (${formatTime(r.timeInTs)})`).join('\n')}`
  }

  if (text.includes('present') || text.includes('attendance') || text.includes('clock')) {
    const todayRecords = attendanceRecords.filter((r) => r.date === today)
    const presentIds = new Set(todayRecords.map((r) => r.userId))
    const stillIn = todayRecords.filter((r) => !r.timeOutTs).length

    if (todayRecords.length === 0) {
      return 'Today no one clock in '
    }
    return `Today attendance:\n• Present: ${presentIds.size} / ${employees.length} employees\n• still in office: ${stillIn}\n• Total employees: ${employees.length}`
  }

  if (text.includes('pending')) {
    const pending = leaveRecords.filter((l) => l.status === 'pending')
    if (pending.length === 0) return 'No pending leave requests.'
    return `${pending.length} leave request(s) are pending :\n${pending
      .map((l) => `• ${l.userName} — ${l.type}, ${l.days} days (${l.startDate})`)
      .join('\n')}`
  }

  if (text.includes('leave')) {
    const approved = leaveRecords.filter((l) => l.status === 'approved').length
    const pending = leaveRecords.filter((l) => l.status === 'pending').length
    const rejected = leaveRecords.filter((l) => l.status === 'rejected').length
    return `Leave requests overview:\n• Approved: ${approved}\n• Pending: ${pending}\n• Rejected: ${rejected}`
  }

  if (text.includes('total employee') || text.includes('total employee') || text.includes('employees')) {
    return `Total employees: ${employees.length}`
  }

  return 'sorry to say but i can not understand this. "help" type the word than i understand what should i do,You can search for an employees record by entering their name..'
}

export default function AdminChatBot() {
  const app = useApp()
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [thread, setThread] = useState([
    { from: 'bot', text: 'Hi!I am your admin assistant. You can ask me anything about attendance and leave records. Type "help" to see available options.' },
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
            <span>Admin Assistant</span>
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
              placeholder="Question.."
            />
            <button type="submit" className="btn btn-primary">Send</button>
          </form>
        </div>
      )}
    </>
  )
}
