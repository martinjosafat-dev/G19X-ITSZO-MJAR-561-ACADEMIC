import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getRequestErrorMessage,
  registerCandidateAndStartInterview,
  type CandidateCreate,
} from '../services/interviewService'

const initialForm: CandidateCreate = {
  first_name: '',
  last_name: '',
  email: '',
  phone: null,
}

function RegistrationPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState(initialForm)
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleChange(field: keyof CandidateCreate, value: string) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: field === 'phone' && value.trim() === '' ? null : value,
    }))
    setErrorMessage('')
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')
    setIsSubmitting(true)

    try {
      const interview = await registerCandidateAndStartInterview(form)
      navigate(`/chat/${interview.id}`)
    } catch (error: unknown) {
      setErrorMessage(getRequestErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  const inputClassName =
    'mt-2 block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100'

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <section className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/70 sm:p-10">
        <div className="mb-8 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">
            PluriOne
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Comienza tu entrevista
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Completa tus datos para iniciar tu entrevista asistida por IA.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block text-sm font-medium text-slate-700">
              First Name
              <input
                autoComplete="given-name"
                className={inputClassName}
                maxLength={100}
                name="first_name"
                onChange={(event) => handleChange('first_name', event.target.value)}
                placeholder="Jane"
                required
                value={form.first_name}
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Last Name
              <input
                autoComplete="family-name"
                className={inputClassName}
                maxLength={100}
                name="last_name"
                onChange={(event) => handleChange('last_name', event.target.value)}
                placeholder="Doe"
                required
                value={form.last_name}
              />
            </label>
          </div>

          <label className="block text-sm font-medium text-slate-700">
            Email
            <input
              autoComplete="email"
              className={inputClassName}
              maxLength={255}
              name="email"
              onChange={(event) => handleChange('email', event.target.value)}
              placeholder="jane@example.com"
              required
              type="email"
              value={form.email}
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Phone
            <input
              autoComplete="tel"
              className={inputClassName}
              maxLength={30}
              name="phone"
              onChange={(event) => handleChange('phone', event.target.value)}
              placeholder="+1 555 0100"
              type="tel"
              value={form.phone ?? ''}
            />
          </label>

          {errorMessage && (
            <p
              aria-live="polite"
              className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
              role="alert"
            >
              {errorMessage}
            </p>
          )}

          <button
            className="w-full rounded-xl bg-indigo-600 px-5 py-3.5 font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? 'Preparando entrevista…' : 'Iniciar entrevista'}
          </button>
        </form>
      </section>
    </main>
  )
}

export default RegistrationPage
