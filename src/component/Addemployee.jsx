import { useState } from 'react'
import { useApp } from '../AppContext'
import Modal from './Modal'

export default function AddEmployee() {
  const { addEmployee, deleteEmployee, users } = useApp()

  const [showModal, setShowModal] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [lastCreated, setLastCreated] = useState(null)

  const [deleteConfirmId, setDeleteConfirmId] = useState(null)

  function askDelete(user) {
    setDeleteConfirmId(user.id)
  }

  function cancelDelete() {
    setDeleteConfirmId(null)
  }

  async function confirmDelete(user) {
    await deleteEmployee(user.id)
    setDeleteConfirmId(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const newUser = await addEmployee({ name: name.trim(), email: email.trim() })
    setLastCreated(newUser)
    setName('')
    setEmail('')
    setShowModal(false)
  }

  const employees = users.filter((u) => u.role === 'user')

  return (
    <div className="card">
      <div className="card-header-row">
        <h2 className="card-title">All Employees</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Add Employee
        </button>
      </div>

      {lastCreated && (
        <div className="credentials-box">
          <p><strong>Employee are create!</strong> </p>
          <p>Username: <span className="mono">{lastCreated.username}</span></p>
          <p>Password: <span className="mono">{lastCreated.password}</span></p>
        </div>
      )}

      {employees.length === 0 ? (
        <p className="empty-state">empty.</p>
      ) : (
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Username</th>
                <th>Password</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td className="mono">{u.username}</td>
                  <td className="mono">{u.password}</td>
                  <td>
                    {deleteConfirmId === u.id ? (
                      <span className="inline-confirm">
                        <span className="inline-confirm-text">Delete?</span>
                        <button className="btn btn-sm btn-danger" onClick={() => confirmDelete(u)}>
                          Yes
                        </button>
                        <button className="btn btn-sm" onClick={cancelDelete}>
                          No
                        </button>
                      </span>
                    ) : (
                      <button className="btn btn-sm btn-danger" onClick={() => askDelete(u)}>
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <Modal title="Add Employee" onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="attendance-form">
            <label>
              Full Name
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </label>

            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Create Employee
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
