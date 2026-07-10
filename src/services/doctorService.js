import apiClient from './apiClient.js';
import { API_ENDPOINTS } from '../config/api.js';

export async function addPatient(data) {
  const response = await apiClient.post(API_ENDPOINTS.doctor.addPatient, data);
  return response.data;
}

export async function updatePatient(id, data) {
  const response = await apiClient.put(API_ENDPOINTS.doctor.editPatient(id), data);
  return response.data;
}

export async function createCase(data) {
  const response = await apiClient.post(API_ENDPOINTS.doctor.createCase, data);
  return response.data;
}

export async function updateCase(id, data) {
  const response = await apiClient.put(API_ENDPOINTS.doctor.editCase(id), data);
  return response.data;
}
