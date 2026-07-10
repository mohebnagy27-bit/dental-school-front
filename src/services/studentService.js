import apiClient from './apiClient.js';
import { API_ENDPOINTS } from '../config/api.js';

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

export async function unreserveCase(caseId) {
  const response = await apiClient.patch(API_ENDPOINTS.student.unreserveCase(caseId));
  return response.data;
}

export async function completeCase(caseId) {
  const response = await apiClient.patch(API_ENDPOINTS.student.completeCase(caseId));
  return response.data;
}

export async function updateCaseNotes(caseId, notes) {
  const response = await apiClient.patch(API_ENDPOINTS.student.updateNotes(caseId), { notes });
  return response.data;
}

export async function getReservedCases() {
  const response = await apiClient.get(API_ENDPOINTS.student.getReservedCases);
  return response.data;
}

export async function getCompletedCases() {
  const response = await apiClient.get(API_ENDPOINTS.student.getCompletedCases);
  return response.data;
}
