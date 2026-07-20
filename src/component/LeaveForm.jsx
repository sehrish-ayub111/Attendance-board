import { useState } from 'react'
import { useApp } from '../AppContext'

// Available leave type options for the dropdown
const LEAVE_TYPES = ['Sick Leave', 'Casual Leave', 'Annual Leave', 'Other']

export default function LeaveForm() {
  const { addLeave, todayStr } = useApp()

  const [startDate, setStartDate] = useState(todayStr()) // defaults to today
  const [days, setDays] = useState(1) // number of leave days requested
  const [type, setType] = useState(LEAVE_TYPES[0]) // defaults to first leave type
  const [reason, setReason] = useState('')
  const [submitted, setSubmitted] = useState(false) // controls the temporary success message

  // Calculates the end date by adding (days - 1) to the start date
  // e.g. start = today, days = 3 → end = today + 2 days (3 days total inclusive)
  function calcEndDate(start, numDays) {
    const d = new Date(start)
    d.setDate(d.getDate() + (Number(numDays) - 1))
    return d.toISOString().split('T')[0]
  }

  // Recalculated on every render based on current startDate/days
  const endDate = calcEndDate(startDate, days)

  // Submits the leave request, resets some fields, and shows a temporary success message
  async function handleSubmit(e) {
    e.preventDefault()
    await addLeave({ startDate, endDate, days: Number(days), type, reason })
    setReason('') // clear reason field
    setDays(1) // reset days back to default
    setSubmitted(true) // show success message
    setTimeout(() => setSubmitted(false), 2000) // hide success message after 2 seconds
  }

  return (
    <div className="card">
      <h2 className="card-title">Apply for Leave</h2>
      <form onSubmit={handleSubmit} className="attendance-form">
        <div className="form-row">
          {/* Start date — can't be set before today */}
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

          {/* Number of days requested */}
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

          {/* Leave type dropdown */}
          <label>
            Leave Type
            <select value={type} onChange={(e) => setType(e.target.value)}>
              {LEAVE_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </label>
        </div>

        {/* Reason textarea (required) */}
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

        {/* Temporary success message, shown for 2 seconds after submission */}
        {submitted && (
          <p className="form-success">Leave request  are submit  — admin approval pending .</p>
        )}
      </form>
    </div>
  )
}