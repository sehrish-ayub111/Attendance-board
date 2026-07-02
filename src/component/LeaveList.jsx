import { useState, useEffect } from 'react'
import { useApp } from '../AppContext'

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'today', label: 'Today' },
  { key: 'yesterday', label: 'Yesterday' },
  { key: 'week', label: 'Last Week' },
  { key: 'month', label: 'Last Month' },
]

const STATUS_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
]

function daysAgo(dateStr) {
  const recordDay = new Date(dateStr)
  recordDay.setHours(0, 0, 0, 0)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.round((today - recordDay) / (1000 * 60 * 60 * 24))
}


export default function LeaveList({ mode, pendingTrigger }) {
  const { currentUser, leaveRecords, updateLeaveStatus } = useApp()
  const [filter, setFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (pendingTrigger) {
      setStatusFilter('pending')
    }
  }, [pendingTrigger])

  const baseRows =
    mode === 'admin'
      ? leaveRecords
      : leaveRecords.filter((r) => r.userId === currentUser.id)

  function matchesDateFilter(r) {
    if (filter === 'all') return true
    const diff = daysAgo(r.startDate)
    if (filter === 'today') return diff === 0
    if (filter === 'yesterday') return diff === 1
    if (filter === 'week') return diff >= 0 && diff <= 7
    if (filter === 'month') return diff >= 0 && diff <= 30
    return true
  }

  function matchesStatusFilter(r) {
    if (statusFilter === 'all') return true
    return r.status === statusFilter
  }

  const rows = baseRows
    .filter(matchesDateFilter)
    .filter(matchesStatusFilter)
    .filter((r) => r.userName.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const ad = a.startDate ? new Date(a.startDate).getTime() : 0
      const bd = b.startDate ? new Date(b.startDate).getTime() : 0
      return bd - ad
    })

  return (
    <div className="card">
      <div className="card-header-row">
        <h2 className="card-title">
          {mode === 'admin' ? 'All Leave Requests' : 'My Leave Requests'}
        </h2>
        <div className="filter-bar">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              className={`tab tab-sm ${filter === f.key ? 'tab-active' : ''}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {mode === 'admin' && (
        <>
          <div className="filter-bar status-filter-bar">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.key}
                className={`tab tab-sm ${statusFilter === f.key ? 'tab-active' : ''}`}
                onClick={() => setStatusFilter(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>

          <input
            type="text"
            className="search-input"
            placeholder="search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </>
      )}

      {rows.length === 0 ? (
        <p className="empty-state">empty</p>
      ) : (
        <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Days</th>
              <th>Type</th>
              <th>Reason</th>
              <th>Status</th>
              {mode === 'admin' && <th>Action</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.userName}</td>
                <td className="mono">{r.startDate}</td>
                <td className="mono">{r.endDate}</td>
                <td className="mono">{r.days}</td>
                <td>{r.type}</td>
                <td>{r.reason}</td>
                <td>
                  <span className={`status-pill status-${r.status}`}>{r.status}</span>
                </td>
                {mode === 'admin' && (
                  <td className="actions">
                    {r.status === 'pending' ? (
                      <>
                        <button
                          className="btn btn-sm btn-success"
                          onClick={() => updateLeaveStatus(r.id, 'approved')}
                        >
                          Approve
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => updateLeaveStatus(r.id, 'rejected')}
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <span className="muted">—</span>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}
    </div>
  )
}
