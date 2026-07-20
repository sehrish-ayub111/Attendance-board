// Generic reusable modal component — centered popup card with a title,
// close ("×") button, and a content area (children) for whatever form/content
// is passed in. Used throughout the app (Edit Attendance, Employee Profile, etc.)
export default function Modal({ title, onClose, children }) {
  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 14,
        padding: 24,
        width: '100%',
        maxWidth: 380, // caps width on larger screens
        maxHeight: '90vh', // prevents modal from exceeding viewport height
        overflowY: 'auto', // scrolls internally if content is too tall
        boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
        boxSizing: 'border-box',
        position: 'absolute',
        // Center the modal in the viewport using the classic
        // top/left 50% + translate(-50%, -50%) trick
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1000, // sits above other page content
      }}
    >
      {/* Header row: title on the left, close button on the right */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: '1.1rem', margin: 0 }}>
          {title}
        </h3>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '1.5rem',
            lineHeight: 1,
            cursor: 'pointer',
            color: '#5c6b62',
            padding: 0,
          }}
        >
          ×
        </button>
      </div>

      {/* Content area — whatever is passed as children (form fields, text, etc.),
          laid out in a vertical stack with spacing between items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>{children}</div>
    </div>
  )
}