const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

function getToken() {
  return localStorage.getItem('token')
}

function clearToken() {
  localStorage.removeItem('token')
}

async function request(path, options = {}) {
  const token = getToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })

  if (res.status === 401) {
    clearToken()
    throw new Error('Unauthorized: session expired. Please log in again.')
  }

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.message || 'Something went wrong')
  }

  return data
}

// Auth
export async function login(email, password) {
  const data = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  if (data.token) {
    localStorage.setItem('token', data.token)
  }
  return data
}

export async function register(name, email, password) {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  })
}

export function logout() {
  clearToken()
}

// Tasks
export async function getTasks() {
  return request('/tasks')
}

export async function createTask(taskData) {
  return request('/tasks', {
    method: 'POST',
    body: JSON.stringify(taskData),
  })
}

export async function updateTask(id, taskData) {
  return request(`/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(taskData),
  })
}

export async function deleteTask(id) {
  return request(`/tasks/${id}`, { method: 'DELETE' })
}

export async function chatWithTutor(message) {
  return request('/ai/chat', {
    method: 'POST',
    body: JSON.stringify({ message }),
  })
}

export async function generateStudyPlan(planData) {
  return request('/ai/study-plan', {
    method: 'POST',
    body: JSON.stringify(planData),
  })
}
