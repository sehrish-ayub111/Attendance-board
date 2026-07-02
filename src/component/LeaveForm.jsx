import { useState } from 'react'
import { useApp } from '../AppContext'

const LEAVE_TYPES = ['Sick Leave', 'Casual Leave', 'Annual Leave', 'Other']

export default function LeaveForm() {
  const { addLeave, todayStr } = useApp()

  const [startDate, setStartDate] = useState(todayStr())
  const [days, setDays] = useState(1)
  const [type, setType] = useState(LEAVE_TYPES[0])
  const [reason, setReason] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function calcEndDate(start, numDays) {
    const d = new Date(start)
    d.setDate(d.getDate() + (Number(numDays) - 1))
    return d.toISOString().split('T')[0]
  }

  const endDate = calcEndDate(startDate, days)

  async function handleSubmit(e) {
    e.preventDefault()
    await addLeave({ startDate, endDate, days: Number(days), type, reason })
    setReason('')
    setDays(1)
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 2000)
  }

  return (
    <div className="card">
      <h2 className="card-title">Apply for Leave</h2>
      <form onSubmit={handleSubmit} className="attendance-form">
        <div className="form-row">
          <label>
            Start Date
            <input
              type="date"
              value={startDate}
              min={todayStr()}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </label>

          <label>
            Number of Days
            <input
              type="number"
              min="1"
              value={days}
              onChange={(e) => setDays(e.target.value)}
              required
            />
          </label>

          <label>
            Leave Type
            <select value={type} onChange={(e) => setType(e.target.value)}>
              {LEAVE_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </label>
        </div>

       

        <label>
          Reason
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Leave reason..."
            rows={3}
            required
          />
        </label>

        <button type="submit" className="btn btn-primary">
          Submit Leave Request
        </button>

        {submitted && (
          <p className="form-success">Leave request  are submit  — admin approval pending .</p>
        )}
      </form>
    </div>
  )
}
