import type {
  StudentCheckinHistoryResponse,
  StudentCheckinMeResponse,
  StudentCheckinSessionStartResponse,
  StudentCheckinSubmitResponse,
} from '../types/studentCheckin'

const STUDENT_TOKEN_KEY = 'student_checkin_token'
const STUDENT_DEVICE_ID_KEY = 'student_checkin_device_id'

function getStudentToken() {
  return localStorage.getItem(STUDENT_TOKEN_KEY)
}

export function saveStudentToken(token: string) {
  localStorage.setItem(STUDENT_TOKEN_KEY, token)
}

function generateDeviceId() {
  return `device-${crypto.randomUUID()}`
}

export function getOrCreateDeviceId() {
  let value = localStorage.getItem(STUDENT_DEVICE_ID_KEY)
  if (!value) {
    value = generateDeviceId()
    localStorage.setItem(STUDENT_DEVICE_ID_KEY, value)
  }
  return value
}

function getDeviceLabel() {
  return `${navigator.platform || 'unknown'} | ${navigator.userAgent}`
}

export async function startStudentCheckinSession(accessToken: string) {
  const response = await fetch('/api/v1/student-checkin/session/start', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      access_token: accessToken,
      device_id: getOrCreateDeviceId(),
      device_label: getDeviceLabel(),
      user_agent: navigator.userAgent,
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
    body: JSON.stringify({
      ...params,
      device_id: getOrCreateDeviceId(),
      device_label: getDeviceLabel(),
      user_agent: navigator.userAgent,
    }),
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

export async function acceptStudentGeolocationConsent() {
  const token = getStudentToken()

  const response = await fetch('/api/v1/student-checkin/consent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      is_accepted: true,
      device_id: getOrCreateDeviceId(),
      device_label: getDeviceLabel(),
      user_agent: navigator.userAgent,
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || 'Failed to accept consent')
  }

  return response.json()
}