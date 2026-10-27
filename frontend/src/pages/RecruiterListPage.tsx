import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  getRequestErrorMessage,
  listInterviews,
  type InterviewSummary,
} from '../services/interviewService'

function RecruiterListPage() {
  const [interviews, setInterviews] = useState<InterviewSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let isCurrent = true

    async function loadInterviews() {
      try {
        const result = await listInterviews()
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

        <section className="overflow-hidden rounded-2xl bg-white shadow-lg shadow-slate-200/70">
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
                        {interview.status}
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
