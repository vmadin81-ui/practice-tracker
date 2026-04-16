import type {
  StudentCheckinHistoryResponse,
  StudentCheckinMeResponse,
  StudentCheckinSessionStartResponse,
  StudentCheckinSubmitResponse,
} from '../types/studentCheckin'

const STUDENT_TOKEN_KEY = 'student_checkin_token'

function getStudentToken() {
  return localStorage.getItem(STUDENT_TOKEN_KEY)
}

export function saveStudentToken(token: string) {
  localStorage.setItem(STUDENT_TOKEN_KEY, token)
}

export async function startStudentCheckinSession(accessToken: string) {
  const response = await fetch('/api/v1/student-checkin/session/start', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      access_token: accessToken,
      device_label: navigator.userAgent,
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || 'Failed to start student session')
  }

  return response.json() as Promise<StudentCheckinSessionStartResponse>
}

export async function getStudentCheckinMe() {
  const token = getStudentToken()
  const response = await fetch('/api/v1/student-checkin/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || 'Failed to load student check-in info')
  }

  return response.json() as Promise<StudentCheckinMeResponse>
}

export async function submitStudentCheckin(params: {
  latitude: number
  longitude: number
  accuracy_m?: number | null
}) {
  const token = getStudentToken()
  const response = await fetch('/api/v1/student-checkin/submit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(params),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || 'Failed to submit student check-in')
  }

  return response.json() as Promise<StudentCheckinSubmitResponse>
}

export async function getStudentCheckinHistory() {
  const token = getStudentToken()
  const response = await fetch('/api/v1/student-checkin/history', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || 'Failed to load check-in history')
  }

  return response.json() as Promise<StudentCheckinHistoryResponse>
}