import apiClient from './apiClient.js';
import { API_ENDPOINTS } from '../config/api.js';

export async function staffLogin(data) {
  const response = await apiClient.post(API_ENDPOINTS.auth.staffLogin, data);
  return response.data;
}

export async function checkStudentStatus(studentId) {
  const response = await apiClient.post(API_ENDPOINTS.auth.studentCheck, { studentId });
  return response.data;
}

export async function activateStudent(data) {
  const response = await apiClient.post(API_ENDPOINTS.auth.studentActivate, data);
  return response.data;
}

export async function studentLogin(data) {
  const response = await apiClient.post(API_ENDPOINTS.auth.studentLogin, data);
  return response.data;
}
