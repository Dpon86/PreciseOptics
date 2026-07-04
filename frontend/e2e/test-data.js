/**
 * E2E Test Data Configuration
 * 
 * These are real records from the development database (db.sqlite3).
 * All IDs are stable as long as the DB is not wiped.
 * 
 * To regenerate run:
 *   cd Backend && python manage.py shell -c "..."
 */

export const TEST_PATIENT = {
  id: '56747eb4-4b3f-49e6-bcca-df188350a6d9',
  firstName: 'Sarah',
  lastName: 'White',
  fullName: 'Sarah White',
  dob: '1954-11-19',
  searchTerm: 'Sarah White',
};

export const TEST_CONSULTATION = {
  id: 'bb353582-0a20-46d6-a889-b5ea9e41680a',
  patientId: '56747eb4-4b3f-49e6-bcca-df188350a6d9',
};

export const TEST_PRESCRIPTION = {
  id: 'e8f78cb9-7087-43e4-86c9-defbd4f77eb7',
  patientId: '56747eb4-4b3f-49e6-bcca-df188350a6d9',
};

export const TEST_EYE_TEST = {
  id: '1455896c-ea34-4ed2-a4bc-92c36848319f',
  patientId: '56747eb4-4b3f-49e6-bcca-df188350a6d9',
};

export const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin123',
};
