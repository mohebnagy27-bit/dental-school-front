import apiClient from './apiClient.js';
import { API_ENDPOINTS } from '../config/api.js';

export async function getPatientsOverview() {
  const response = await apiClient.get(API_ENDPOINTS.management.patientsOverview);
  return response.data;
}

export async function getDashboardStatistics() {
  const response = await apiClient.get(API_ENDPOINTS.management.dashboard);
  return response.data;
}

export async function getPatientDetails(patientId) {
  const response = await apiClient.get(API_ENDPOINTS.management.patientDetails(patientId));
  return response.data;
}