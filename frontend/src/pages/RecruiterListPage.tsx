import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  getRequestErrorMessage,
  isUnauthorizedError,
  listInterviews,
  translateInterviewStatus,
  type InterviewSummary,
} from '../services/interviewService'

const recruiterKeyStorageKey = 'plurione_recruiter_api_key'

function RecruiterListPage() {
  const [interviews, setInterviews] = useState<InterviewSummary[]>([])
  const [recruiterKey, setRecruiterKey] = useState(
    () => sessionStorage.getItem(recruiterKeyStorageKey) ?? '',
  )
  const [keyInput, setKeyInput] = useState('')
  const [loadedKey, setLoadedKey] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const isLoading = Boolean(recruiterKey) && loadedKey !== recruiterKey

  useEffect(() => {
    if (!recruiterKey) {
      return
    }

    let isCurrent = true

    async function loadInterviews() {
      try {
        const result = await listInterviews(recruiterKey)
        if (isCurrent) {
          setInterviews(result)
        }
      } catch (error: unknown) {
        if (isCurrent) {
          if (isUnauthorizedError(error)) {
            sessionStorage.removeItem(recruiterKeyStorageKey)
            setRecruiterKey('')
            setKeyInput('')
            setInterviews([])
            setErrorMessage('La llave no es válida o expiró. Ingresa una llave válida.')
            return
          }
          setErrorMessage(
            getRequestErrorMessage(
              error,
              'No se pudo cargar la lista de entrevistas.',
            ),
          )
        }
      } finally {
        if (isCurrent) {
          setLoadedKey(recruiterKey)
        }
      }
    }

    void loadInterviews()

    return () => {
      isCurrent = false
    }
  }, [recruiterKey])

  function submitRecruiterKey(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const newKey = keyInput.trim()
    if (!newKey) {
      return
    }

    sessionStorage.setItem(recruiterKeyStorageKey, newKey)
    setRecruiterKey(newKey)
    setKeyInput('')
    setLoadedKey(null)
    setInterviews([])
    setErrorMessage('')
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">
            PluriOne
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            Entrevistas
          </h1>
          <p className="mt-2 text-slate-600">
            Revisa el estado y los resultados de las entrevistas.
          </p>
        </header>

        {!recruiterKey && (
          <form
            className="mb-6 rounded-2xl bg-white p-6 shadow-lg shadow-slate-200/70"
            onSubmit={submitRecruiterKey}
          >
            <label
              className="block text-sm font-semibold text-slate-700"
              htmlFor="recruiter-key"
            >
              Llave de acceso del reclutador
            </label>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <input
                autoComplete="current-password"
                className="min-w-0 flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                id="recruiter-key"
                onChange={(event) => setKeyInput(event.target.value)}
                required
                type="password"
                value={keyInput}
              />
              <button
                className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200"
                type="submit"
              >
                Continuar
              </button>
            </div>
            <p className="mt-3 text-xs text-slate-500">
              La llave se guarda solo en la sesión actual del navegador.
            </p>
          </form>
        )}

        <section className="overflow-hidden rounded-2xl bg-white shadow-lg shadow-slate-200/70">
          {errorMessage ? (
            <p
              aria-live="polite"
              className="m-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
              role="alert"
            >
              {errorMessage}
            </p>
          ) : !recruiterKey ? (
            <p className="px-6 py-10 text-center text-sm text-slate-500">
              Ingresa la llave para consultar las entrevistas.
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
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-6 py-4 font-semibold" scope="col">
                      Candidato
                    </th>
                    <th className="px-6 py-4 font-semibold" scope="col">
                      Estado
                    </th>
                    <th className="px-6 py-4 font-semibold" scope="col">
                      Puntaje
                    </th>
                    <th className="px-6 py-4 font-semibold" scope="col">
                      Fecha
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {interviews.map((interview) => (
                    <tr className="hover:bg-slate-50" key={interview.id}>
                      <td className="px-6 py-4">
                        <Link
                          className="font-semibold text-indigo-700 hover:text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          to={`/recruiter/${encodeURIComponent(interview.id)}`}
                        >
                          {interview.candidate_name}
                        </Link>
                        <p className="mt-1 text-slate-500">
                          {interview.candidate_email}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-slate-700">
                        {translateInterviewStatus(interview.status)}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-800">
                        {interview.score === null
                          ? 'Pendiente'
                          : `${interview.score}/100`}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {new Date(interview.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

export default RecruiterListPage
