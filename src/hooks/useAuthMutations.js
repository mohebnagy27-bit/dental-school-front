import { useMutation } from '@tanstack/react-query'

import {
  activateStudent,
  checkStudentStatus,
  staffLogin,
  studentLogin,
} from '../services/authService'
import { useAuth } from '../context/AuthContext'

export function useDoctorLogin() {
  const { login } = useAuth()

  return useMutation({
    mutationFn: staffLogin,
    onSuccess: (data) => {
      login({ token: data.token, user: data.user, role: data.user.role })
    },
  })
}

export function useStudentStatus() {
  return useMutation({
    mutationFn: checkStudentStatus,
  })
}

export function useStudentActivation() {
  const { login } = useAuth()

  return useMutation({
    mutationFn: activateStudent,
    onSuccess: (data) => {
      if (data.token && data.student) {
        login({ token: data.token, user: data.student, role: 'STUDENT' })
      }
    },
  })
}

export function useStudentLogin() {
  const { login } = useAuth()

  return useMutation({
    mutationFn: studentLogin,
    onSuccess: (data) => {
      login({ token: data.token, user: data.student, role: 'STUDENT' })
    },
  })
}
