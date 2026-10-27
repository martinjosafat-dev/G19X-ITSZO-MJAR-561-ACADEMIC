import { useEffect, useState } from 'react'
import {
  getInterviewTranscript,
  getRecruiterInterviews,
  getRequestErrorMessage,
  type InterviewTranscript,
  type RecruiterInterviewSummary,
} from '../services/interviewService'

function RecruiterDashboard() {
  const [interviews, setInterviews] = useState<RecruiterInterviewSummary[]>([])
  const [selectedInterviewId, setSelectedInterviewId] = useState<string | null>(
    null,
  )
  const [transcript, setTranscript] = useState<InterviewTranscript | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isTranscriptLoading, setIsTranscriptLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [transcriptError, setTranscriptError] = useState('')

  useEffect(() => {
    let isCurrent = true

    async function loadInterviews() {
      try {
        const result = await getRecruiterInterviews()
        if (isCurrent) {
          setInterviews(result)
        }
      } catch (error: unknown) {
        if (isCurrent) {
          setErrorMessage(
            getRequestErrorMessage(
              error,
              'No se pudo cargar la lista de entrevistas.',
            ),
          )
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false)
        }
      }
    }

    void loadInterviews()

    return () => {
      isCurrent = false
    }
  }, [])

  useEffect(() => {
    if (!selectedInterviewId) {
      return
    }

    const interviewId = selectedInterviewId
    let isCurrent = true

    async function loadTranscript() {
      try {
        const result = await getInterviewTranscript(interviewId)
        if (isCurrent) {
          setTranscript(result)
        }
      } catch (error: unknown) {
        if (isCurrent) {
          setTranscriptError(
            getRequestErrorMessage(
              error,
              'No se pudo cargar el historial de la entrevista.',
            ),
          )
        }
      } finally {
        if (isCurrent) {
          setIsTranscriptLoading(false)
        }
      }
    }

    void loadTranscript()

    return () => {
      isCurrent = false
    }
  }, [selectedInterviewId])

  function toggleTranscript(interviewId: string) {
    const isClosing = selectedInterviewId === interviewId
    setSelectedInterviewId(isClosing ? null : interviewId)
    setTranscript(null)
    setTranscriptError('')
    setIsTranscriptLoading(!isClosing)
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">
            PluriOne
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            Panel de reclutador
          </h1>
          <p className="mt-2 text-slate-600">
            Consulta las entrevistas y revisa el historial de cada candidato.
          </p>
        </header>

        <section className="overflow-hidden rounded-2xl bg-white shadow-lg shadow-slate-200/70">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="text-lg font-semibold">Entrevistas</h2>
          </div>

          {errorMessage ? (
            <p
              aria-live="polite"
              className="m-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
              role="alert"
            >
              {errorMessage}
            </p>
          ) : isLoading ? (
            <p className="px-6 py-10 text-center text-sm text-slate-500" role="status">
              Cargando entrevistas…
            </p>
          ) : interviews.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-slate-500">
              Todavía no hay entrevistas registradas.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-6 py-4 font-semibold" scope="col">
                      Candidato
                    </th>
                    <th className="px-6 py-4 font-semibold" scope="col">
                      Correo
                    </th>
                    <th className="px-6 py-4 font-semibold" scope="col">
                      Estado
                    </th>
                    <th className="px-6 py-4 font-semibold" scope="col">
                      Puntaje
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {interviews.map((interview) => {
                    const isSelected = selectedInterviewId === interview.id

                    return (
                      <tr className="align-top" key={interview.id}>
                        <td className="px-6 py-4">
                          <button
                            aria-expanded={isSelected}
                            className="text-left font-semibold text-indigo-700 hover:text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            onClick={() => void toggleTranscript(interview.id)}
                            type="button"
                          >
                            {interview.candidate_name}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {interview.candidate_email}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                            {interview.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-800">
                          {interview.score === null
                            ? 'Pendiente'
                            : `${interview.score}/100`}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {selectedInterviewId && (
            <section
              aria-labelledby="transcript-heading"
              className="border-t border-slate-200 bg-slate-50 px-6 py-6"
            >
              <h2 className="text-lg font-semibold" id="transcript-heading">
                Historial de la entrevista
              </h2>
              {transcriptError ? (
                <p
                  aria-live="polite"
                  className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
                  role="alert"
                >
                  {transcriptError}
                </p>
              ) : isTranscriptLoading ? (
                <p className="mt-4 text-sm text-slate-500" role="status">
                  Cargando historial…
                </p>
              ) : transcript?.transcript.length ? (
                <ol className="mt-4 space-y-3">
                  {transcript.transcript.map((entry, index) => (
                    <li
                      className="rounded-xl border border-slate-200 bg-white p-4"
                      key={`${transcript.id}-${index}`}
                    >
                      <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
                        {entry.role === 'user' ? 'Candidato' : 'Entrevistador IA'}
                      </p>
                      <p className="mt-2 whitespace-pre-wrap leading-6 text-slate-700">
                        {entry.content}
                      </p>
                    </li>
                  ))}
                </ol>
              ) : (
                !isTranscriptLoading && (
                  <p className="mt-4 text-sm text-slate-500">
                    Esta entrevista todavía no tiene mensajes.
                  </p>
                )
              )}
            </section>
          )}
        </section>
      </div>
    </main>
  )
}

export default RecruiterDashboard
