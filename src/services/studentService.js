import apiClient from './apiClient.js';
import { API_ENDPOINTS } from '../config/api.js';

export async function updateStudentProfile(academicYear) {
  const response = await apiClient.patch(API_ENDPOINTS.student.updateProfile, { academicYear });
  return response.data;
}

export async function getPatients() {
  const response = await apiClient.get(API_ENDPOINTS.student.getPatients);
  return response.data;
}

export async function getPatientDetails(id) {
  const response = await apiClient.get(API_ENDPOINTS.student.getPatientById(id));
  return response.data;
}

export async function getCases() {
  const response = await apiClient.get(API_ENDPOINTS.student.getAllCases);
  return response.data;
}

export async function bookCase(caseId) {
  const response = await apiClient.post(API_ENDPOINTS.student.bookCase(caseId));
  return response.data;
}

export async function unreserveCase(studentId, caseId) {
  const response = await apiClient.patch(API_ENDPOINTS.student.unreserveCase(caseId), { studentId });
  return response.data;
}

export async function completeCase(studentId, caseId) {
  const response = await apiClient.patch(API_ENDPOINTS.student.completeCase(caseId), { studentId });
  return response.data;
}

export async function updateCaseNotes(studentId, caseId, notes) {
  const response = await apiClient.patch(API_ENDPOINTS.student.updateNotes(caseId), { studentId, notes });
  return response.data;
}

export async function getReservedCases(studentId) {
  const response = await apiClient.get(API_ENDPOINTS.student.getReservedCases, {
    params: { studentId },
  });
  return response.data;
}

export async function getCompletedCases(studentId) {
  const response = await apiClient.get(API_ENDPOINTS.student.getCompletedCases, {
    params: { studentId },
  });
  return response.data;
}
