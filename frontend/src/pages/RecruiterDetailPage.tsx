import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  getInterviewDetail,
  getRequestErrorMessage,
  isUnauthorizedError,
  translateInterviewStatus,
  type InterviewDetail,
} from '../services/interviewService'

const recruiterKeyStorageKey = 'plurione_recruiter_api_key'

function RecruiterDetailPage() {
  const { interviewId } = useParams<{ interviewId: string }>()
  const [recruiterKey, setRecruiterKey] = useState(
    () => sessionStorage.getItem(recruiterKeyStorageKey) ?? '',
  )
  const [interview, setInterview] = useState<InterviewDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (!interviewId || !recruiterKey) {
      return
    }

    const currentInterviewId = interviewId
    let isCurrent = true

    async function loadInterview() {
      try {
        const result = await getInterviewDetail(currentInterviewId, recruiterKey)
        if (isCurrent) {
          setInterview(result)
        }
      } catch (error: unknown) {
        if (isCurrent) {
          if (isUnauthorizedError(error)) {
            sessionStorage.removeItem(recruiterKeyStorageKey)
            setRecruiterKey('')
            setInterview(null)
            setErrorMessage('La llave no es válida o expiró. Vuelve a ingresar una llave válida.')
            return
          }
          setErrorMessage(
            getRequestErrorMessage(
              error,
              'No se pudo cargar el detalle de la entrevista.',
            ),
          )
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false)
        }
      }
    }

    void loadInterview()

    return () => {
      isCurrent = false
    }
  }, [interviewId, recruiterKey])

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <Link
          className="text-sm font-semibold text-indigo-700 hover:text-indigo-900"
          to="/recruiter"
        >
          ← Volver a entrevistas
        </Link>

        {errorMessage || !interviewId ? (
          <p
            aria-live="polite"
            className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
            role="alert"
          >
            {errorMessage || 'No se encontró el identificador de la entrevista.'}
          </p>
        ) : !recruiterKey ? (
          <p
            aria-live="polite"
            className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
            role="status"
          >
            La llave de reclutador no está disponible.{' '}
            <Link className="font-semibold underline" to="/recruiter">
              Vuelve al listado para ingresarla.
            </Link>
          </p>
        ) : isLoading ? (
          <p className="mt-8 text-center text-sm text-slate-500" role="status">
            Cargando entrevista…
          </p>
        ) : interview ? (
          <>
            <header className="mt-6 rounded-2xl bg-white p-6 shadow-lg shadow-slate-200/70">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">
                Detalle de entrevista
              </p>
              <h1 className="mt-2 text-2xl font-bold">
                {interview.candidate_name}
              </h1>
              <p className="mt-1 text-slate-600">{interview.candidate_email}</p>
              <dl className="mt-6 grid gap-4 sm:grid-cols-3">
                <div>
                  <dt className="text-xs font-semibold uppercase text-slate-500">
                    Estado
                  </dt>
                  <dd className="mt-1 font-medium">
                    {translateInterviewStatus(interview.status)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase text-slate-500">
                    Puntaje
                  </dt>
                  <dd className="mt-1 font-medium">
                    {interview.score === null
                      ? 'Pendiente'
                      : `${interview.score}/100`}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase text-slate-500">
                    Fecha
                  </dt>
                  <dd className="mt-1 font-medium">
                    {new Date(interview.created_at).toLocaleString()}
                  </dd>
                </div>
              </dl>
            </header>

            {interview.feedback && (
              <section className="mt-6 rounded-2xl bg-white p-6 shadow-lg shadow-slate-200/70">
                <h2 className="text-lg font-semibold">Retroalimentación</h2>
                <p className="mt-3 whitespace-pre-wrap leading-7 text-slate-600">
                  {interview.feedback}
                </p>
              </section>
            )}

            <p className="mt-4 text-xs leading-5 text-slate-500">
              Este puntaje lo generó una IA. Es un apoyo para la revisión del
              equipo de selección, no una decisión de contratación.
            </p>

            <section className="mt-6 rounded-2xl bg-white p-6 shadow-lg shadow-slate-200/70">
              <h2 className="text-lg font-semibold">Transcript</h2>
              {interview.transcript.length ? (
                <ol className="mt-4 space-y-3">
                  {interview.transcript.map((entry, index) => (
                    <li
                      className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                      key={`${interview.id}-${index}`}
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
                <p className="mt-3 text-sm text-slate-500">
                  Esta entrevista todavía no tiene mensajes.
                </p>
              )}
            </section>
          </>
        ) : null}
      </div>
    </main>
  )
}

export default RecruiterDetailPage
