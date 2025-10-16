import { useState, useRef, useEffect, useCallback } from 'react'
import { X, Send, Bot, Sparkles, MessageCircle } from 'lucide-react'

function ChatbotPopup({ isOpen, onClose, userContext = {} }) {
  const initialGreeting = useRef(false)
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        'Hola 👋 ¿Cómo va tu día hoy?\n\nSi tienes tareas o algo que te preocupa, cuéntame un poco y lo vemos junt@s.',
      typing: false
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [conversationId, setConversationId] = useState(null)
  const [isAssistantTyping, setIsAssistantTyping] = useState(false)
  const [inFlightCount, setInFlightCount] = useState(0)

  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const typingIntervalRef = useRef(null)
  const inFlightRef = useRef(0)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  const clearTypingInterval = useCallback(() => {
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current)
      typingIntervalRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!initialGreeting.current) {
      initialGreeting.current = true
      return
    }
    scrollToBottom()
  }, [messages, scrollToBottom])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }

    if (!isOpen) {
      clearTypingInterval()
      setIsAssistantTyping(false)
    }
  }, [isOpen, clearTypingInterval])

  useEffect(() => {
    return () => {
      clearTypingInterval()
    }
  }, [clearTypingInterval])

  const animateAssistantResponse = useCallback(
    (text, createPlaceholder = false) => {
      return new Promise((resolve) => {
        const beginAnimation = () => {
          if (!text) {
            setMessages((prev) => {
              const updated = [...prev]
              const lastIndex = updated.length - 1
              if (lastIndex >= 0 && updated[lastIndex].role === 'assistant') {
                updated[lastIndex] = {
                  ...updated[lastIndex],
                  content: '',
                  typing: false
                }
              }
              return updated
            })
            resolve()
            return
          }

          let index = 0
          const totalLength = text.length
          const totalDurationMs = Math.min(2000, Math.max(700, totalLength * 12))
          const intervalMs = Math.max(8, Math.floor(totalDurationMs / totalLength))

          clearTypingInterval()

          typingIntervalRef.current = setInterval(() => {
            index += 1
            setMessages((prev) => {
              const updated = [...prev]
              const lastIndex = updated.length - 1
              if (lastIndex >= 0 && updated[lastIndex].role === 'assistant') {
                updated[lastIndex] = {
                  ...updated[lastIndex],
                  content: text.slice(0, index),
                  typing: index < totalLength
                }
              }
              return updated
            })

            if (index >= totalLength) {
              clearTypingInterval()
              resolve()
            }
          }, intervalMs)
        }

        if (createPlaceholder) {
          setMessages((prev) => [
            ...prev,
            { role: 'assistant', content: '', typing: true }
          ])
          setTimeout(beginAnimation, 20)
        } else {
          beginAnimation()
        }
      })
    },
    [clearTypingInterval]
  )

  const handleSend = useCallback(
    async (messageContent) => {
      const token = localStorage.getItem('access_token')
      if (!token) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: 'Necesitas iniciar sesión para continuar la conversación.',
            typing: false,
            error: true
          }
        ])
        return
      }

      let startedTyping = false
      setMessages((prev) => {
        const updated = [
          ...prev,
          { role: 'user', content: messageContent, typing: false }
        ]
        const hasTypingBubble = updated.some(
          (msg) => msg.role === 'assistant' && msg.typing
        )

        if (!hasTypingBubble) {
          updated.push({ role: 'assistant', content: '', typing: true })
          startedTyping = true
        }

        return updated
      })

      if (startedTyping) {
        setIsAssistantTyping(true)
      }

      setInFlightCount((count) => {
        const next = count + 1
        inFlightRef.current = next
        return next
      })

      try {
        const response = await fetch('http://127.0.0.1:8000/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            message: messageContent,
            conversation_id: conversationId,
            context: userContext
          })
        })

        if (!response.ok) {
          throw new Error('Error al obtener respuesta del chatbot')
        }

        const data = await response.json()
        if (data.conversation_id) {
          setConversationId(data.conversation_id)
        }

        if (data.buffered) {
          return
        }

        const assistantChunks =
          Array.isArray(data.responses) && data.responses.length
            ? data.responses.filter(Boolean)
            : data.response
              ? [data.response]
              : []

        if (!assistantChunks.length) {
          assistantChunks.push(
            'Necesito un momento para pensar mejor tu pregunta, ¿podrías intentarlo de nuevo?'
          )
        }

        await animateAssistantResponse(assistantChunks[0])

        for (let index = 1; index < assistantChunks.length; index += 1) {
          await animateAssistantResponse(assistantChunks[index], true)
        }
      } catch (error) {
        console.error('Error en chatbot:', error)
        clearTypingInterval()
        setMessages((prev) => {
          const updated = [...prev]
          const lastIndex = updated.length - 1
          if (lastIndex >= 0 && updated[lastIndex].role === 'assistant') {
            updated[lastIndex] = {
              role: 'assistant',
              content:
                'Lo siento, tuve un problema al procesar tu mensaje. ¿Podrías intentarlo de nuevo?',
              typing: false,
              error: true
            }
          } else {
            updated.push({
              role: 'assistant',
              content:
                'Lo siento, tuve un problema al procesar tu mensaje. ¿Podrías intentarlo de nuevo?',
              typing: false,
              error: true
            })
          }
          return updated
        })
      } finally {
        setInFlightCount((count) => {
          const next = Math.max(0, count - 1)
          inFlightRef.current = next
          if (next === 0 && !typingIntervalRef.current) {
            setIsAssistantTyping(false)
          }
          return next
        })
      }
    },
    [animateAssistantResponse, clearTypingInterval, conversationId, userContext]
  )

  const sendMessage = () => {
    const trimmed = inputMessage.trim()
    if (!trimmed) return

    setInputMessage('')
    handleSend(trimmed)
  }

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      sendMessage()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed bottom-24 right-4 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#5B8FC3] to-[#4A7FB0] text-white p-4 rounded-t-2xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg flex items-center gap-2">
              Asistente IA
              <Sparkles className="w-4 h-4 animate-sparkle" />
            </h3>
            <p className="text-xs text-white/80">Cuidemos tu bienestar académico</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}-${message.content.slice(0, 25)}`}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
                message.role === 'user'
                  ? 'bg-[#5B8FC3] text-white'
                  : 'bg-gray-100 text-gray-900'
              } ${message.error ? 'border border-red-200' : ''}`}
            >
              {message.typing ? (
                <div className="flex items-center gap-1">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>
              ) : (
                <p className="text-sm whitespace-pre-wrap leading-relaxed">
                  {message.content}
                </p>
              )}
            </div>
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 space-y-2">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(event) => setInputMessage(event.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe tu mensaje..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#5B8FC3] focus:border-transparent"
          />
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim()}
            className="w-10 h-10 bg-[#5B8FC3] text-white rounded-full flex items-center justify-center hover:bg-[#4A7FB0] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Presiona Enter para enviar</span>
          {isAssistantTyping && (
            <span className="flex items-center gap-1 text-[#5B8FC3]">
              <MessageCircle className="w-3 h-3" />
              El asistente está respondiendo...
            </span>
          )}
        </div>
        {inFlightCount > 1 && (
          <div className="flex items-center gap-2 text-xs text-[#5B8FC3] bg-[#E8F1FB] rounded-xl px-3 py-2">
            <MessageCircle className="w-4 h-4" />
            <span>
              Estamos preparando una respuesta para {inFlightCount} mensajes recientes
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export default ChatbotPopup
