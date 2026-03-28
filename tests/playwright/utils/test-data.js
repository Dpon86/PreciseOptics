// utils/test-data.js - Test Data Generators and Fixtures

/**
 * Generate unique timestamp-based identifier
 */
export function generateUniqueId() {
  return Date.now().toString();
}

/**
 * Generate test patient data
 */
export function generatePatientData(suffix = null) {
  const id = suffix || generateUniqueId();
  
  return {
    // Personal Information
    first_name: `TestPatient${id}`,
    last_name: `Doe${id}`,
    middle_name: 'Test',
    date_of_birth: '1980-05-15',
    gender: 'M',
    blood_group: 'A+',
    
    // Contact Information
    phone_number: `071234${id.slice(-5)}`,
    alternate_phone: `072345${id.slice(-5)}`,
    email: `testpatient${id}@preciseoptics.test`,
    
    // Address Information
    address_line_1: `${id} Test Street`,
    address_line_2: 'Apartment 5B',
    city: 'London',
    state: 'Greater London',
    postal_code: 'SW1A 1AA',
    country: 'UK',
    
    // Emergency Contact
    emergency_contact_name: 'Jane Doe',
    emergency_contact_relationship: 'Spouse',
    emergency_contact_phone: '07999123456',
    
    // Insurance Information
    insurance_provider: 'BUPA',
    insurance_number: `INS${id}`,
    nhs_number: `999${id.slice(-7)}`,
    
    // Medical Information
    allergies: 'No known allergies',
    medical_history: 'No significant medical history',
    current_medications: 'None'
  };
}

/**
 * Generate minimal patient data (required fields only)
 */
export function generateMinimalPatientData(suffix = null) {
  const id = suffix || generateUniqueId();
  
  return {
    first_name: `MinPatient${id}`,
    last_name: `Test${id}`,
    date_of_birth: '1990-01-01',
    gender: 'F',
    phone_number: `071111${id.slice(-5)}`,
    address_line_1: `${id} Min Street`,
    city: 'Manchester',
    state: 'Greater Manchester',
    postal_code: 'M1 1AA',
    country: 'UK',
    emergency_contact_name: 'Emergency Contact',
    emergency_contact_relationship: 'Friend',
    emergency_contact_phone: '07888999000'
  };
}

/**
 * Generate consultation data
 */
export function generateConsultationData(patientId, doctorId = null) {
  const now = new Date();
  const scheduledTime = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now
  
  return {
    patient: patientId,
    consulting_doctor: doctorId,
    consultation_type: 'routine_check',
    status: 'scheduled',
    scheduled_time: scheduledTime.toISOString().slice(0, 16), // Format: YYYY-MM-DDTHH:MM
    chief_complaint: 'Routine eye examination - automated test',
    history_of_present_illness: 'Patient reports no current issues. Routine check-up.',
    clinical_impression: 'To be determined after examination',
    diagnosis_primary: 'Pending examination',
    treatment_plan: 'Complete eye examination protocol',
    follow_up_required: true,
    follow_up_duration: '6 months',
    follow_up_instructions: 'Schedule follow-up examination in 6 months',
    consultation_notes: 'Automated test consultation - comprehensive eye exam'
  };
}

/**
 * Generate Visual Acuity Test data
 */
export function generateVisualAcuityTestData(patientId, consultationId = null, performedBy = null) {
  const testDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  
  return {
    patient: patientId,
    consultation: consultationId,
    performed_by: performedBy,
    test_date: testDate,
    eye_side: 'both',
    status: 'completed',
    test_method: 'snellen_chart',
    
    // Right Eye Measurements
    right_eye_unaided: '6/12',
    right_eye_aided: '6/6',
    right_eye_pinhole: '6/6',
    
    // Left Eye Measurements
    left_eye_unaided: '6/9',
    left_eye_aided: '6/6',
    left_eye_pinhole: '6/6',
    
    // Binocular Vision
    binocular_vision: '6/6',
    
    // Additional Information
    findings: 'Visual acuity within normal limits with correction',
    recommendations: 'Continue current prescription',
    notes: 'Automated test - patient cooperated well',
    follow_up_required: false
  };
}

/**
 * Generate Refraction Test data
 */
export function generateRefractionTestData(patientId, consultationId = null, performedBy = null) {
  const testDate = new Date().toISOString().split('T')[0];
  
  return {
    patient: patientId,
    consultation: consultationId,
    performed_by: performedBy,
    test_date: testDate,
    eye_side: 'both',
    status: 'completed',
    method: 'subjective',
    
    // Right Eye Refraction
    right_sphere: '-1.50',
    right_cylinder: '-0.50',
    right_axis: '90',
    right_add: '0.00',
    right_prism: '0.00',
    
    // Left Eye Refraction
    left_sphere: '-1.75',
    left_cylinder: '-0.75',
    left_axis: '85',
    left_add: '0.00',
    left_prism: '0.00',
    
    // Additional Measurements
    pupillary_distance: '63',
    
    // Clinical Notes
    findings: 'Mild myopia with astigmatism bilaterally',
    recommendations: 'Prescribe corrective lenses',
    notes: 'Automated test - refraction stable',
    follow_up_required: true,
    follow_up_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 1 year
  };
}

/**
 * Generate Visual Field Test data
 */
export function generateVisualFieldTestData(patientId, consultationId = null, performedBy = null) {
  const testDate = new Date().toISOString().split('T')[0];
  
  return {
    patient: patientId,
    consultation: consultationId,
    performed_by: performedBy,
    test_date: testDate,
    eye_side: 'both',
    status: 'completed',
    test_type: 'humphrey_24_2',
    strategy: 'sita_standard',
    
    // Right Eye Results
    right_eye_md: '-2.5',
    right_eye_psd: '2.1',
    right_eye_vfi: '98',
    right_eye_fixation_losses: '0',
    right_eye_false_positives: '2',
    right_eye_false_negatives: '1',
    
    // Left Eye Results
    left_eye_md: '-1.8',
    left_eye_psd: '1.9',
    left_eye_vfi: '99',
    left_eye_fixation_losses: '1',
    left_eye_false_positives: '1',
    left_eye_false_negatives: '0',
    
    // Clinical Assessment
    findings: 'Visual fields within normal limits bilaterally',
    recommendations: 'Repeat test in 12 months for baseline comparison',
    notes: 'Good test reliability, automated test',
    follow_up_required: true,
    follow_up_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  };
}

/**
 * Generate OCT Scan data
 */
export function generateOCTScanData(patientId, consultationId = null, performedBy = null) {
  const testDate = new Date().toISOString().split('T')[0];
  
  return {
    patient: patientId,
    consultation: consultationId,
    performed_by: performedBy,
    test_date: testDate,
    eye_side: 'both',
    status: 'completed',
    scan_type: 'macula',
    machine_model: 'Heidelberg Spectralis',
    
    // Measurements (these might be text fields)
    right_eye_central_thickness: '245',
    left_eye_central_thickness: '248',
    
    // Clinical Assessment
    findings: 'Normal macular contour and thickness bilaterally. No intraretinal or subretinal fluid detected.',
    recommendations: 'Repeat scan if symptoms develop',
    notes: 'High-quality scans obtained, automated test',
    follow_up_required: false
  };
}

/**
 * List of all eye test types with their data generators
 */
export const eyeTestTypes = [
  {
    name: 'Visual Acuity Test',
    route: '/eye-tests/visual-acuity/add',
    apiEndpoint: 'visual-acuity-tests',
    dataGenerator: generateVisualAcuityTestData
  },
  {
    name: 'Refraction Test',
    route: '/eye-tests/refraction/add',
    apiEndpoint: 'refraction-tests',
    dataGenerator: generateRefractionTestData
  },
  {
    name: 'Visual Field Test',
    route: '/eye-tests/visual-field/add',
    apiEndpoint: 'visual-field-tests',
    dataGenerator: generateVisualFieldTestData
  },
  {
    name: 'OCT Scan',
    route: '/eye-tests/oct/add',
    apiEndpoint: 'oct-scans',
    dataGenerator: generateOCTScanData
  }
];
