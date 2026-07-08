import { useState, useEffect, useRef } from 'react'
import { useApp } from '../AppContext'

export default function ChatScreen({ chatId, title, photo, onBack, onTitleClick }) {
  const { currentUser, messages, sendMessage, markChatRead } = useApp()
  const [text, setText] = useState('')
  const bottomRef = useRef(null)

  const thread = messages
    .filter((m) => m.chatId === chatId)
    .sort((a, b) => a.timestamp - b.timestamp)

  useEffect(() => {
    if (chatId) markChatRead(chatId)
  }, [chatId, messages.length])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [thread.length])

  async function handleSend(e) {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return
    await sendMessage({ chatId, text: trimmed })
    setText('')
  }

  return (
    <div className="wa-screen">
      {/* Header */}
      <div className="wa-header">
        <button className="wa-back-btn" onClick={onBack}>←</button>
        {onTitleClick ? (
          <button className="wa-header-identity wa-header-identity-clickable" onClick={onTitleClick}>
            <div className="wa-avatar">
              {photo ? (
                <img src={photo} alt={title} className="wa-avatar-img" />
              ) : (
                title?.[0]?.toUpperCase()
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

      {/* Messages */}
      <div className="wa-body">
        {thread.length === 0 ? (
          <p className="wa-empty">Koi message nahi — pehla message bhejein!</p>
        ) : (
          thread.map((m) => {
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
        <div ref={bottomRef} />
      </div>

      {/* Input */}
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