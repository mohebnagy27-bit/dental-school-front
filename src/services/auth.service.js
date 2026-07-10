/**
 * auth.service.js
 *
 * Mock authentication service — simulates network latency and covers every
 * auth scenario: doctor login, student ID check, first-time password setup,
 * and returning-student password login.
 *
 * ─── HOW TO REPLACE WITH REAL API ──────────────────────────────────────────
 *   1. Set BASE_URL to your backend endpoint.
 *   2. Swap each function body for a real fetch / axios call.
 *   3. Keep the returned object shapes identical — pages depend on them.
 * ────────────────────────────────────────────────────────────────────────────
 */

const DELAY_MS = 1100

/** Simulate async network round-trip */
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// ─── Mock Data ──────────────────────────────────────────────────────────────

const MOCK_DOCTOR = {
  username: 'doctor',
  password: 'password123',
  id:       'DOC-001',
  name:     'Dr. Ahmed Khalil',
}

/**
 * Mock student registry.
 *   STU-20240001 — first-time login (no password set yet)
 *   STU-20240042 — returning student  (password: "password123")
 *   STU-20240099 — first-time login
 */
const MOCK_STUDENTS = {
  'STU-20240001': { name: 'Mohamed Ahmed', firstLoginCompleted: false, password: '' },
  'STU-20240042': { name: 'Sara Hassan',   firstLoginCompleted: true,  password: 'password123' },
  'STU-20240099': { name: 'Ali Mohamed',   firstLoginCompleted: false, password: '' },
}

// ─── Auth Service Object ────────────────────────────────────────────────────

export const authService = {

  /**
   * loginDoctor
   * Validates doctor credentials.
   *
   * Returns:
   *   { success: true,  token, user }          → credentials correct
   *   { success: false, message }              → wrong credentials
   */
  async loginDoctor(username, password) {
    await delay(DELAY_MS)

    if (
      username.trim() === MOCK_DOCTOR.username &&
      password         === MOCK_DOCTOR.password
    ) {
      return {
        success: true,
        token:   'mock-doctor-jwt-token',
        user:    { id: MOCK_DOCTOR.id, name: MOCK_DOCTOR.name, role: 'doctor' },
      }
    }

    return {
      success: false,
      message: 'Invalid username or password. Please check your credentials and try again.',
    }
  },

  /**
   * checkStudentId
   * Looks up a student by ID.
   *
   * Returns:
   *   { success: true,  firstLoginCompleted, studentId, user }  → ID found
   *   { success: false, message }                               → ID not found
   *
   * The caller uses `firstLoginCompleted` to decide routing:
   *   false → /student/create-password
   *   true  → /student/password
   */
  async checkStudentId(studentId) {
    await delay(DELAY_MS)

    const id      = studentId.trim().toUpperCase()
    const student = MOCK_STUDENTS[id]

    if (!student) {
      return {
        success:             false,
        firstLoginCompleted: false,
        message:             'Student ID not found. Please verify your ID and try again.',
      }
    }

    return {
      success:             true,
      firstLoginCompleted: student.firstLoginCompleted,
      studentId:           id,
      user:                { id, name: student.name, role: 'student' },
    }
  },

  /**
   * createStudentPassword
   * Sets a first-time student's password.
   *
   * In production: verifies session token, hashes password server-side,
   * marks `firstLoginCompleted = true`.
   */
  async createStudentPassword(studentId, password) {
    await delay(DELAY_MS)

    const student = MOCK_STUDENTS[studentId]
    if (!student) {
      return { success: false, message: 'Session expired. Please sign in again.' }
    }

    // In-memory mock mutation
    MOCK_STUDENTS[studentId] = { ...student, firstLoginCompleted: true, password }

    return {
      success: true,
      token:   'mock-student-jwt-token',
      user:    { id: studentId, name: student.name, role: 'student' },
    }
  },

  /**
   * loginStudent
   * Authenticates a returning student with their password.
   *
   * Mock password for STU-20240042: "password123"
   */
  async loginStudent(studentId, password) {
    await delay(DELAY_MS)

    const student = MOCK_STUDENTS[studentId]
    if (!student) {
      return { success: false, message: 'Session expired. Please sign in again.' }
    }

    const isValid = password === student.password || password === 'password123'

    if (isValid) {
      return {
        success: true,
        token:   'mock-student-jwt-token',
        user:    { id: studentId, name: student.name, role: 'student' },
      }
    }

    return {
      success: false,
      message: 'Incorrect password. Please try again.',
    }
  },
}
