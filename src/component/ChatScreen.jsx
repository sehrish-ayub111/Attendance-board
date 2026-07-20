import { useState, useEffect, useRef } from 'react'
import { useApp } from '../AppContext'

// Generic reusable chat screen — used for both admin<->employee 1-on-1 chats.
// chatId identifies the conversation, title/photo are the other person's display info,
// onBack closes the chat, onTitleClick (optional) is used to open a profile modal
export default function ChatScreen({ chatId, title, photo, onBack, onTitleClick }) {
  const { currentUser, messages, sendMessage, markChatRead } = useApp()
  const [text, setText] = useState('') // current text in the message input box
  const bottomRef = useRef(null) // used to auto-scroll to the latest message

  // Get only messages belonging to this chat, sorted oldest to newest
  const thread = messages
    .filter((m) => m.chatId === chatId)
    .sort((a, b) => a.timestamp - b.timestamp)

  // Mark this chat as read whenever it's opened or a new message arrives
  useEffect(() => {
    if (chatId) markChatRead(chatId)
  }, [chatId, messages.length])

  // Auto-scroll to the bottom whenever the number of messages changes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [thread.length])

  // Send the typed message, then clear the input
  async function handleSend(e) {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return
    await sendMessage({ chatId, text: trimmed })
    setText('')
  }

  return (
    <div className="wa-screen">

      {/* Header: back button + other person's avatar/name.
          If onTitleClick is provided (e.g. admin viewing employee chat), 
          the identity becomes clickable to open a profile modal */}
      <div className="wa-header">
        <button className="wa-back-btn" onClick={onBack}>←</button>
        {onTitleClick ? (
          <button className="wa-header-identity wa-header-identity-clickable" onClick={onTitleClick}>
            <div className="wa-avatar">
              {photo ? (
                <img src={photo} alt={title} className="wa-avatar-img" />
              ) : (
                title?.[0]?.toUpperCase() // fallback: first letter of name if no photo
              )}
            </div>
            <span className="wa-title">{title}</span>
          </button>
        ) : (
          <div className="wa-header-identity">
            <div className="wa-avatar">
              {photo ? (
                <img src={photo} alt={title} className="wa-avatar-img" />
              ) : (
                title?.[0]?.toUpperCase()
              )}
            </div>
            <span className="wa-title">{title}</span>
          </div>
        )}
      </div>

      {/* Message list body */}
      <div className="wa-body">
        {thread.length === 0 ? (
          // Shown when there's no conversation history yet
          <p className="wa-empty">No messages yet — send the first message!</p>
        ) : (
          thread.map((m) => {
            // Determine if this message was sent by the current logged-in user (for bubble alignment/style)
            const mine = m.senderId === currentUser.id
            return (
              <div key={m.id} className={`wa-msg-row ${mine ? 'wa-mine' : 'wa-theirs'}`}>
                <div className={`wa-bubble ${mine ? 'wa-bubble-mine' : 'wa-bubble-theirs'}`}>
                  <p className="wa-text">{m.text}</p>
                </div>
              </div>
            )
          })
        )}
        {/* Invisible anchor for auto-scrolling to the latest message */}
        <div ref={bottomRef} />
      </div>

      {/* Message input form at the bottom */}
      <form className="wa-footer" onSubmit={handleSend}>
        <input
          className="wa-input"
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message"
        />
        <button type="submit" className="wa-send-btn">
          ➤
        </button>
      </form>
    </div>
  )
}