import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  finishInterview,
  getRequestErrorMessage,
  sendMessage,
} from '../services/interviewService'

interface Message {
  role: 'user' | 'ai'
  content: string
}

function ChatPage() {
  const { interviewId } = useParams<{ interviewId: string }>()
  const navigate = useNavigate()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isFinishing, setIsFinishing] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const messageContent = input.trim()

    if (!interviewId || !messageContent || isLoading) {
      return
    }

    setInput('')
    setErrorMessage('')
    setMessages((currentMessages) => [
      ...currentMessages,
      { role: 'user', content: messageContent },
    ])
    setIsLoading(true)

    try {
      const result = await sendMessage(interviewId, messageContent)
      const aiResponse = result.response
      if (aiResponse) {
        setMessages((currentMessages) => [
          ...currentMessages,
          { role: 'ai', content: aiResponse },
        ])
      }
    } catch (error: unknown) {
      setMessages((currentMessages) => currentMessages.slice(0, -1))
      setInput(messageContent)
      setErrorMessage(
        getRequestErrorMessage(
          error,
          'No se pudo enviar el mensaje. Inténtalo de nuevo.',
        ),
      )
    } finally {
      setIsLoading(false)
    }
  }

  async function handleFinishInterview() {
    if (!interviewId || isLoading || isFinishing) {
      return
    }

    setErrorMessage('')
    setIsFinishing(true)
    try {
      await finishInterview(interviewId)
      navigate(`/evaluation/${interviewId}`)
    } catch (error: unknown) {
      setErrorMessage(
        getRequestErrorMessage(
          error,
          'No se pudo finalizar la entrevista. Inténtalo de nuevo.',
        ),
      )
    } finally {
      setIsFinishing(false)
    }
  }

  return (
    <main className="flex h-screen flex-col bg-slate-100 text-slate-900">
      <header className="border-b border-slate-200 bg-white px-4 py-4 shadow-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">
              PluriOne
            </p>
            <h1 className="mt-1 text-lg font-bold">Sala de Entrevista IA</h1>
          </div>
          <p className="hidden max-w-56 truncate text-xs text-slate-400 sm:block">
            Entrevista {interviewId ?? 'no disponible'}
          </p>
          <button
            className="shrink-0 rounded-xl border border-indigo-200 px-4 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50 focus:outline-none focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isLoading || isFinishing || !interviewId}
            onClick={() => void handleFinishInterview()}
            type="button"
          >
            {isFinishing ? 'Finalizando…' : 'Finalizar Entrevista'}
          </button>
        </div>
      </header>

      <section
        aria-label="Historial de la conversación"
        aria-live="polite"
        className="flex-1 overflow-y-auto px-4 py-6"
      >
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
          {messages.length === 0 && (
            <p className="m-auto rounded-2xl bg-white px-6 py-4 text-center text-sm text-slate-500 shadow-sm">
              Escribe un mensaje para comenzar tu entrevista.
            </p>
          )}

          {messages.map((message, index) => (
            <div
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
              key={`${message.role}-${index}`}
            >
              <p
                className={`max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm sm:max-w-[75%] ${
                  message.role === 'user'
                    ? 'rounded-br-md bg-indigo-600 text-white'
                    : 'rounded-bl-md border border-slate-200 bg-white text-slate-700'
                }`}
              >
                {message.content}
              </p>
            </div>
          ))}

          {isLoading && (
            <p
              aria-label="La IA está escribiendo"
              className="w-fit rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm"
              role="status"
            >
              La IA está escribiendo…
            </p>
          )}
          <div ref={messagesEndRef} />
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white px-4 py-4">
        <form
          className="mx-auto flex max-w-4xl items-end gap-3"
          onSubmit={handleSubmit}
        >
          <div className="min-w-0 flex-1">
            {errorMessage && (
              <p aria-live="polite" className="mb-2 text-sm text-rose-600" role="alert">
                {errorMessage}
              </p>
            )}
            <label className="sr-only" htmlFor="chat-message">
              Escribe tu mensaje
            </label>
            <input
              autoComplete="off"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isLoading || isFinishing || !interviewId}
              id="chat-message"
              onChange={(event) => setInput(event.target.value)}
              placeholder="Escribe tu respuesta…"
              value={input}
            />
          </div>
          <button
            className="shrink-0 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isLoading || isFinishing || !input.trim() || !interviewId}
            type="submit"
          >
            {isLoading ? 'Enviando…' : 'Enviar'}
          </button>
        </form>
      </footer>
    </main>
  )
}

export default ChatPage
