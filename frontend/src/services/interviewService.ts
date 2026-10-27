import axios from 'axios'
import api from './api'

export interface CandidateCreate {
  first_name: string
  last_name: string
  email: string
  phone: string | null
}

export interface CandidateResponse extends CandidateCreate {
  id: string
  created_at: string
}

export interface InterviewCreate {
  candidate_id: string
}

export interface InterviewResponse {
  id: string
  candidate_id: string
  status: string
  transcript: Array<Record<string, unknown>> | null
  ai_score: number | null
  created_at: string
}

export interface ChatResponse {
  message: string
  response: string | null
}

export interface InterviewEvaluation {
  interview_id: string
  score: number
  feedback: string
}

export interface RecruiterInterviewSummary {
  id: string
  candidate_name: string
  candidate_email: string
  status: string
  score: number | null
}

export interface InterviewTranscriptEntry {
  role: string
  content: string
}

export interface InterviewTranscript {
  id: string
  transcript: InterviewTranscriptEntry[]
}

export async function createCandidate(
  candidate: CandidateCreate,
): Promise<CandidateResponse> {
  const response = await api.post<CandidateResponse>('/candidates/', candidate)
  return response.data
}

export async function createInterview(
  candidateId: string,
): Promise<InterviewResponse> {
  const payload: InterviewCreate = { candidate_id: candidateId }
  const response = await api.post<InterviewResponse>('/interviews/', payload)
  return response.data
}

export async function sendMessage(
  interviewId: string,
  message: string,
): Promise<ChatResponse> {
  const response = await api.post<ChatResponse>(
    `/interviews/${encodeURIComponent(interviewId)}/chat`,
    { message },
  )
  return response.data
}

export async function finishInterview(
  interviewId: string,
): Promise<InterviewEvaluation> {
  const response = await api.post<InterviewEvaluation>(
    `/interviews/${encodeURIComponent(interviewId)}/finish`,
  )
  return response.data
}

export async function getInterviewEvaluation(
  interviewId: string,
): Promise<InterviewEvaluation> {
  const response = await api.get<InterviewEvaluation>(
    `/interviews/${encodeURIComponent(interviewId)}/evaluation`,
  )
  return response.data
}

export async function getRecruiterInterviews(): Promise<
  RecruiterInterviewSummary[]
> {
  const response = await api.get<RecruiterInterviewSummary[]>('/interviews/')
  return response.data
}

export async function getInterviewTranscript(
  interviewId: string,
): Promise<InterviewTranscript> {
  const response = await api.get<InterviewTranscript>(
    `/interviews/${encodeURIComponent(interviewId)}`,
  )
  return response.data
}

export async function registerCandidateAndStartInterview(
  candidate: CandidateCreate,
): Promise<InterviewResponse> {
  const createdCandidate = await createCandidate(candidate)
  return createInterview(createdCandidate.id)
}

export function getRequestErrorMessage(
  error: unknown,
  fallbackMessage = 'No se pudo completar el registro. Inténtalo de nuevo.',
): string {
  if (axios.isAxiosError<{ detail?: string }>(error)) {
    return (
      error.response?.data.detail ??
      fallbackMessage
    )
  }

  return fallbackMessage
}
