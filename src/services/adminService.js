import apiClient from './apiClient.js';
import { API_ENDPOINTS } from '../config/api.js';

export async function uploadStudents(formData) {
  const response = await apiClient.post(API_ENDPOINTS.admin.uploadStudents, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

export async function bulkDeactivateStudents(formData) {
  const response = await apiClient.post(API_ENDPOINTS.admin.bulkDeactivateStudents, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

export async function addDoctor(data) {
  const response = await apiClient.post(API_ENDPOINTS.admin.addDoctor, data);
  return response.data;
}

export async function deactivateDoctor(id) {
  const response = await apiClient.patch(API_ENDPOINTS.admin.deactivateDoctor(id));
  return response.data;
}

export async function reactivateDoctor(id) {
  const response = await apiClient.patch(API_ENDPOINTS.admin.reactivateDoctor(id));
  return response.data;
}

export async function deactivateStudent(id) {
  const response = await apiClient.patch(API_ENDPOINTS.admin.deactivateStudent(id));
  return response.data;
}

export async function reactivateStudent(id) {
  const response = await apiClient.patch(API_ENDPOINTS.admin.reactivateStudent(id));
  return response.data;
}
