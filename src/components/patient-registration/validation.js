export const isValidName = (value) => value.trim().length >= 2;

export const isValidAge = (value) => {
  const age = Number(value.trim());
  return value.trim() !== '' && !Number.isNaN(age) && Number.isInteger(age) && age >= 1 && age <= 120;
};

export const isValidPhone = (value) => {
  const digits = value.replace(/[\s\-\(\)\+\.]/g, '');
  return /^[0-9]{7,15}$/.test(digits);
};

export const isValidGender = (value) => value === 'Male' || value === 'Female';

export function validatePatient(patient) {
  return {
    name: isValidName(patient.name) ? '' : 'Name must be at least 2 characters.',
    age: isValidAge(patient.age) ? '' : 'Enter a valid age (1–120).',
    phone: isValidPhone(patient.phone) ? '' : 'Enter a valid phone number.',
    gender: isValidGender(patient.gender) ? '' : 'Please select a gender.',
  };
}
