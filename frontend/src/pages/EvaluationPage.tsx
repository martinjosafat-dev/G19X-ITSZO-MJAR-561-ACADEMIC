import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import {
  getInterviewEvaluation,
  getRequestErrorMessage,
  type InterviewEvaluation,
} from '../services/interviewService'

function isInterviewEvaluation(value: unknown): value is InterviewEvaluation {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const evaluation = value as Record<string, unknown>
  return (
    typeof evaluation.interview_id === 'string' &&
    typeof evaluation.score === 'number' &&
    Number.isInteger(evaluation.score) &&
    evaluation.score >= 0 &&
    evaluation.score <= 100 &&
    typeof evaluation.feedback === 'string'
  )
}

function EvaluationPage() {
  const { interviewId } = useParams<{ interviewId: string }>()
  const location = useLocation()
  const navigationEvaluation: unknown = location.state
  const [evaluation, setEvaluation] = useState<InterviewEvaluation | null>(() => {
    if (
      isInterviewEvaluation(navigationEvaluation) &&
      navigationEvaluation.interview_id === interviewId
    ) {
      return navigationEvaluation
    }
    return null
  })
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (!interviewId) {
      return
    }

    if (
      isInterviewEvaluation(navigationEvaluation) &&
      navigationEvaluation.interview_id === interviewId
    ) {
      return
    }

    const currentInterviewId = interviewId
    let isCurrent = true

    async function loadEvaluation() {
      try {
        const result = await getInterviewEvaluation(currentInterviewId)
        if (isCurrent) {
          setEvaluation(result)
        }
      } catch (error: unknown) {
        if (isCurrent) {
          setErrorMessage(
            getRequestErrorMessage(
              error,
              'No se pudo cargar la evaluación de la entrevista.',
            ),
          )
        }
      }
    }

    void loadEvaluation()

    return () => {
      isCurrent = false
    }
  }, [interviewId, navigationEvaluation])

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10 text-slate-900">
      <section className="w-full max-w-2xl rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/70 sm:p-12">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">
            PluriOne
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight">
            Evaluación de entrevista
          </h1>
        </div>

        {errorMessage || !interviewId ? (
          <p
            aria-live="polite"
            className="mt-8 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-center text-sm text-rose-700"
            role="alert"
          >
            {errorMessage || 'No se encontró el identificador de la entrevista.'}
          </p>
        ) : evaluation ? (
          <>
            <div className="mx-auto mt-9 flex h-36 w-36 flex-col items-center justify-center rounded-full border-8 border-indigo-100 bg-indigo-50">
              <span className="text-4xl font-bold text-indigo-700">
                {evaluation.score}
              </span>
              <span className="text-xs font-medium uppercase tracking-wide text-indigo-500">
                de 100
              </span>
            </div>

            <div className="mt-9 rounded-2xl bg-slate-50 p-6">
              <h2 className="text-lg font-semibold">Observaciones</h2>
              <p className="mt-3 whitespace-pre-wrap leading-7 text-slate-600">
                {evaluation.feedback}
              </p>
            </div>

            <p className="mt-4 text-center text-xs leading-5 text-slate-500">
              Este puntaje lo generó una IA. Es un apoyo para la revisión del
              equipo de selección, no una decisión de contratación.
            </p>

            <p className="mt-5 break-all text-center text-xs text-slate-400">
              Entrevista {evaluation.interview_id}
            </p>
          </>
        ) : (
          <p className="mt-10 text-center text-sm text-slate-500" role="status">
            Cargando evaluación…
          </p>
        )}

        <div className="mt-8 text-center">
          <Link
            className="inline-flex rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200"
            to="/"
          >
            Volver al inicio
          </Link>
        </div>
      </section>
    </main>
  )
}

export default EvaluationPage
