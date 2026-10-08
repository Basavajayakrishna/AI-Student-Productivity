import { useState, useRef, useEffect } from 'react'
import { chatWithTutor } from '../services/api'

export default function AITutor({ user }) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'ai',
      text: `Hello ${user?.name ? user.name.split(' ')[0] : 'there'}! 👋 I am your AI Study Tutor. Ask me any concept questions, exam prep strategies, or code explanations to help you learn faster.`
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)

  const exampleSuggestions = [
    'Explain binary search in simple terms.',
    'Help me create a study plan for exams.',
    'Explain recursion with an example.'
  ]

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  const handleSend = async (messageToSend) => {
    const text = (typeof messageToSend === 'string' ? messageToSend : inputMessage).trim()
    if (!text || isLoading) return

    const token = localStorage.getItem('token')
    if (!token) {
      setError('You are not logged in. Please log in to continue.')
      return
    }

    setError('')

    const userMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text
    }

    // Add user message immediately
    setMessages((prev) => [...prev, userMessage])
    setInputMessage('')

    setIsLoading(true)

    try {
      const data = await chatWithTutor(text)

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: data.message || 'I could not generate a response. Please try again.'
      }

      setMessages((prev) => [...prev, aiMessage])
    } catch (err) {
      setError(err.message || 'Failed to connect with AI Tutor. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleClearChat = () => {
    setMessages([])
    setError('')
  }

  return (
    <div className="space-y-6">
      {/* Page Title & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
            <span>🤖</span>
            <span>AI Tutor Assistant</span>
          </h2>
          <p className="text-slate-400 mt-1 text-sm sm:text-base">
            Ask questions and learn with your AI tutor.
          </p>
        </div>

        {messages.length > 0 && (
          <button
            onClick={handleClearChat}
            className="self-start sm:self-auto text-xs px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            Clear Conversation
          </button>
        )}
      </div>

      {/* Chat Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col h-[650px] max-h-[75vh] shadow-xl overflow-hidden">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* Empty Chat State with Suggestions */}
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-3xl">
                🤖
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">How can I help you study?</h3>
                <p className="text-xs sm:text-sm text-slate-400 max-w-md mt-1">
                  Choose a question below or type your own question to start learning.
                </p>
              </div>

              {/* Suggestions */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full max-w-xl pt-2">
                {exampleSuggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSend(suggestion)}
                    className="p-3 text-left rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 hover:border-indigo-500/40 text-xs text-slate-300 hover:text-white transition flex flex-col justify-between"
                  >
                    <span>"{suggestion}"</span>
                    <span className="text-[10px] text-indigo-400 mt-2 font-medium">Click to ask →</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Render Messages */}
          {messages.map((msg) => {
            const isUser = msg.sender === 'user'

            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-sm shrink-0">
                    🤖
                  </div>
                )}

                <div
                  className={`rounded-2xl px-4 py-3 text-sm leading-relaxed max-w-[85%] sm:max-w-[75%] break-words shadow-md ${
                    isUser
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-slate-800/90 border border-slate-700/60 text-slate-200 rounded-tl-none whitespace-pre-wrap'
                  }`}
                >
                  {msg.text}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-indigo-300 shrink-0">
                    {user?.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                )}
              </div>
            )
          })}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex items-start gap-3 justify-start">
              <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-sm shrink-0">
                🤖
              </div>
              <div className="bg-slate-800/90 border border-slate-700/60 rounded-2xl rounded-tl-none px-4 py-3 text-slate-400 flex items-center gap-2 shadow-md">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.4s]" />
                <span className="text-xs text-slate-400 ml-1">AI Tutor is thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips (when conversation has started) */}
        {messages.length > 0 && (
          <div className="px-4 py-2 bg-slate-900/60 border-t border-slate-800/60 flex items-center gap-2 overflow-x-auto text-xs no-scrollbar">
            <span className="text-slate-500 text-[11px] whitespace-nowrap">Suggested:</span>
            {exampleSuggestions.map((suggestion, idx) => (
              <button
                key={idx}
                type="button"
                disabled={isLoading}
                onClick={() => handleSend(suggestion)}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700/50 text-[11px] transition disabled:opacity-50"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mx-4 mb-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs sm:text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError('')}
              className="text-rose-400 hover:text-rose-200 text-xs font-bold px-1"
            >
              ✕
            </button>
          </div>
        )}

        {/* Input Area */}
        <div className="p-3 sm:p-4 bg-slate-950/80 border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSend()
            }}
            className="flex items-end gap-2"
          >
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                rows={1}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask your question here... (Press Enter to send, Shift + Enter for new line)"
                disabled={isLoading}
                className="w-full bg-slate-900 border border-slate-700/80 text-slate-100 placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none transition max-h-32 disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-600/20 transition flex items-center gap-1.5 shrink-0"
            >
              <span>Send</span>
              <span>🚀</span>
            </button>
          </form>
          <div className="text-[11px] text-slate-500 mt-1.5 hidden sm:block">
            Shift + Enter for new line • Enter to send
          </div>
        </div>
      </div>
    </div>
  )
}