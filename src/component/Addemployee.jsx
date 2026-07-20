import { useState } from 'react'
import { useApp } from '../AppContext'
import Modal from './Modal'

export default function AddEmployee() {
<<<<<<< HEAD
  // Shared app functions/data from context
  const { addEmployee, deleteEmployee, users } = useApp()

  const [showModal, setShowModal] = useState(false) // controls "Add Employee" modal
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [lastCreated, setLastCreated] = useState(null) // stores the just-created employee (to show credentials)

  const [deleteConfirmId, setDeleteConfirmId] = useState(null) // tracks which row is asking "are you sure?"

  // Show delete confirmation for a specific user
=======
  const { addEmployee, deleteEmployee, users } = useApp()

  const [showModal, setShowModal] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [lastCreated, setLastCreated] = useState(null)

  const [deleteConfirmId, setDeleteConfirmId] = useState(null)

>>>>>>> old-hrm-project
  function askDelete(user) {
    setDeleteConfirmId(user.id)
  }

<<<<<<< HEAD
  // Cancel delete confirmation
=======
>>>>>>> old-hrm-project
  function cancelDelete() {
    setDeleteConfirmId(null)
  }

<<<<<<< HEAD
  // Actually delete the user after confirmation
=======
>>>>>>> old-hrm-project
  async function confirmDelete(user) {
    await deleteEmployee(user.id)
    setDeleteConfirmId(null)
  }

<<<<<<< HEAD
  // Handle form submit -> create employee, show credentials, reset form
=======
>>>>>>> old-hrm-project
  async function handleSubmit(e) {
    e.preventDefault()
    const newUser = await addEmployee({ name: name.trim(), email: email.trim() })
    setLastCreated(newUser)
    setName('')
    setEmail('')
    setShowModal(false)
  }

<<<<<<< HEAD
  // Only show users with role "user" (not admins)
=======
>>>>>>> old-hrm-project
  const employees = users.filter((u) => u.role === 'user')

  return (
    <div className="card">
      <div className="card-header-row">
        <h2 className="card-title">All Employees</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Add Employee
        </button>
      </div>

<<<<<<< HEAD
      {/* Show generated username/password right after creating a new employee */}
=======
>>>>>>> old-hrm-project
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
<<<<<<< HEAD
                    {/* Show Yes/No confirm buttons only for the row being deleted */}
=======
>>>>>>> old-hrm-project
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

<<<<<<< HEAD
      {/* Modal form to add a new employee */}
=======
>>>>>>> old-hrm-project
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
<<<<<<< HEAD
}
=======
}
>>>>>>> old-hrm-project
