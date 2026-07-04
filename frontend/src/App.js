import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PatientProvider } from './context/PatientContext';
// Import all pages using the organized structure
import {
  // Main Pages
  HomePage,
  // Auth Pages
  LoginPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  Setup2FAPage,
  Verify2FAPage,
  // Patient Management
  PatientsPage,
  PatientDetailPage,
  PatientRecordsPage,
  AddPatientPage,
  EditPatientPage,
  AddDiagnosisPage,
  AddTreatmentPage,
  // Treatment Management
  TreatmentsPage,
  TreatmentHistoryPage,
  TreatmentDetailPage,
  // Consultation Management
  ConsultationsPage,
  AddConsultationPage,
  ConsultationDetailPage,
  // Eye Tests
  EyeTestsPage,
  EyeTestDetailPage,
  AddVisualAcuityTestPage,
  AddRefractionTestPage,
  AddTonometryTestPage,
  AddOphthalmoscopyPage,
  AddSlitLampExamPage,
  AddVisualFieldTestPage,
  AddOCTScanPage,
  AddFluoresceinAngiographyPage,
  // Medication Management
  MedicationsPage,
  MedicationDetailPage,
  AddMedicationPage,
  AddMedicinePage,
  EditMedicationPage,
  AddPrescriptionPage,
  PrescriptionDetailPage,
  AddManufacturerPage,
  AddMedicationCategoryPage,
  RecallCenter,
  // Protocols Management
  ProtocolsPage,
  AddProtocolPage,
  EditProtocolPage,
  ProtocolDetailPage,
  AssignProtocolPage,
  PatientProtocolsPage,
  ProtocolBuilderPage,
  ProtocolSchedulePage,
  CompleteProtocolStepPage,
  ConsentFormsPage,
  // Conditions Management
  ConditionsPage,
  PatientConditionsPage,
  AddPatientConditionPage,
  ConditionDetailPage,
  AddConditionProgressPage,
  // Referrals Management
  ReferralsPage,
  CreateReferralPage,
  ReferralDetailPage,
  ReferralSourcesPage,
  AddReferralSourcePage,
  // Alerts
  AlertCenter,
  AlertDetailPage,
  FollowUpAlertsPage,
  ReturnDuePage,
  // Reports
  PatientMedicationsReportPage,
  ConsultationReportPage,
  DrugAuditReportPage,
  PatientVisitsReportPage,
  EyeTestsSummaryReportPage,
  MedicationEffectivenessReportPage,
  PatientProgressDashboard,
  TreatmentEffectivenessReport,
  DiseaseSpecificReport,
  RevenueAnalysisReport,
  BatchTrackingReport,
  PatientOutcomeForm,
  // New Advanced Analytics Reports
  ConditionPrevalenceReport,
  ConditionOutcomesReport,
  ProtocolAdherenceReport,
  ReferralSourceReport,
  PatientOutcomesReport,
  // Audit
  AuditLogsPage,
  AddAuditLogPage,
  // System
  SystemPage,
  ManageStaffPage,
  AddStaffPage,
  EditStaffPage,
  StaffDetailPage,
  AddSpecializationPage,
  FormsOverviewPage
} from './pages';
import AdminDashboard from './pages/AdminDashboard';
import ErrorBoundary from './components/ErrorBoundary';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import './App_new.css';

// Protected Route Component with Patient Context
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, idleWarning, resetIdleTimer, logout } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Wrap authenticated content with PatientProvider
  return (
    <PatientProvider>
      {idleWarning && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
          background: '#b45309', color: '#fff', textAlign: 'center',
          padding: '10px 16px', fontSize: '14px',
        }}>
          You will be logged out in 1 minute due to inactivity.{' '}
          <button
            onClick={resetIdleTimer}
            style={{
              marginLeft: '12px', padding: '4px 14px', cursor: 'pointer',
              background: '#fff', color: '#b45309', border: 'none',
              borderRadius: '4px', fontWeight: 600,
            }}
          >
            Stay logged in
          </button>
          <button
            onClick={logout}
            style={{
              marginLeft: '8px', padding: '4px 14px', cursor: 'pointer',
              background: 'transparent', color: '#fff', border: '1px solid #fff',
              borderRadius: '4px',
            }}
          >
            Log out now
          </button>
        </div>
      )}
      {children}
    </PatientProvider>
  );
};

// Public Route Component (redirects to home if already authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return isAuthenticated ? <Navigate to="/" /> : children;
};

function AppContent() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleMenuClick = () => {
    setSidebarOpen(true);
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  // Show loading screen while checking authentication
  if (authLoading) {
    return (
      <div className="app-loading">
        <div className="loading-content">
          <h2>Loading PreciseOptics...</h2>
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      {isAuthenticated && <Header onMenuClick={handleMenuClick} />}
      {isAuthenticated && (
        <Sidebar isOpen={sidebarOpen} onClose={handleSidebarClose} />
      )}
      <main className="main-content">
        <ErrorBoundary>
          <Routes>
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            } 
          />
          <Route 
            path="/forgot-password" 
            element={
              <PublicRoute>
                <ForgotPasswordPage />
              </PublicRoute>
            } 
          />
          <Route 
            path="/reset-password" 
            element={
              <PublicRoute>
                <ResetPasswordPage />
              </PublicRoute>
            } 
          />
          <Route 
            path="/setup-2fa" 
            element={
              <ProtectedRoute>
                <Setup2FAPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/verify-2fa" 
            element={
              <PublicRoute>
                <Verify2FAPage />
              </PublicRoute>
            } 
          />
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/patients" 
            element={
              <ProtectedRoute>
                <PatientsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/patients/:patientId" 
            element={
              <ProtectedRoute>
                <PatientDetailPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/patients/:patientId/records" 
            element={
              <ProtectedRoute>
                <PatientRecordsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/patients/add" 
            element={
              <ProtectedRoute>
                <AddPatientPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/patients/:id/edit" 
            element={
              <ProtectedRoute>
                <EditPatientPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/patients/:patientId/add-diagnosis" 
            element={
              <ProtectedRoute>
                <AddDiagnosisPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/patients/:patientId/add-treatment" 
            element={
              <ProtectedRoute>
                <AddTreatmentPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/treatments" 
            element={
              <ProtectedRoute>
                <TreatmentsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/patient/:patientId/treatments" 
            element={
              <ProtectedRoute>
                <TreatmentsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/patient/:patientId/treatments/history" 
            element={
              <ProtectedRoute>
                <TreatmentHistoryPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/treatments/:id" 
            element={
              <ProtectedRoute>
                <TreatmentDetailPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/consultations" 
            element={
              <ProtectedRoute>
                <ConsultationsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/consultations/add" 
            element={
              <ProtectedRoute>
                <AddConsultationPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/consultations/:id" 
            element={
              <ProtectedRoute>
                <ConsultationDetailPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/eye-tests" 
            element={
              <ProtectedRoute>
                <EyeTestsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/eye-tests/:testId" 
            element={
              <ProtectedRoute>
                <EyeTestDetailPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/eye-tests/visual-acuity/add" 
            element={
              <ProtectedRoute>
                <AddVisualAcuityTestPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/eye-tests/refraction/add" 
            element={
              <ProtectedRoute>
                <AddRefractionTestPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/eye-tests/tonometry/add" 
            element={
              <ProtectedRoute>
                <AddTonometryTestPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/eye-tests/ophthalmoscopy/add" 
            element={
              <ProtectedRoute>
                <AddOphthalmoscopyPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/eye-tests/slit-lamp/add" 
            element={
              <ProtectedRoute>
                <AddSlitLampExamPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/eye-tests/visual-field/add" 
            element={
              <ProtectedRoute>
                <AddVisualFieldTestPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/eye-tests/oct/add" 
            element={
              <ProtectedRoute>
                <AddOCTScanPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/eye-tests/fluorescein/add" 
            element={
              <ProtectedRoute>
                <AddFluoresceinAngiographyPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/medications" 
            element={
              <ProtectedRoute>
                <MedicationsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/medications/add" 
            element={
              <ProtectedRoute>
                <AddMedicationPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/medications/:id" 
            element={
              <ProtectedRoute>
                <MedicationDetailPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/medications/:id/edit" 
            element={
              <ProtectedRoute>
                <EditMedicationPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/manufacturers/add" 
            element={
              <ProtectedRoute>
                <AddManufacturerPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/medication-categories/add" 
            element={
              <ProtectedRoute>
                <AddMedicationCategoryPage />
              </ProtectedRoute>
            } 
          />
          <Route
            path="/medications/recalls"
            element={
              <ProtectedRoute>
                <RecallCenter />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/prescriptions/add" 
            element={
              <ProtectedRoute>
                <AddPrescriptionPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/prescriptions/:prescriptionId" 
            element={
              <ProtectedRoute>
                <PrescriptionDetailPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/audit-logs" 
            element={
              <ProtectedRoute>
                <AuditLogsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/audit" 
            element={
              <ProtectedRoute>
                <AuditLogsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/audit-logs/add" 
            element={
              <ProtectedRoute>
                <AddAuditLogPage />
              </ProtectedRoute>
            } 
          />
          {/* System Routes */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/system" 
            element={
              <ProtectedRoute>
                <SystemPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/staff" 
            element={
              <ProtectedRoute>
                <ManageStaffPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/staff/add" 
            element={
              <ProtectedRoute>
                <AddStaffPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/staff/:id" 
            element={
              <ProtectedRoute>
                <StaffDetailPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/staff/:id/edit" 
            element={
              <ProtectedRoute>
                <EditStaffPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/specializations" 
            element={
              <ProtectedRoute>
                <AddSpecializationPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/specializations/add" 
            element={
              <ProtectedRoute>
                <AddSpecializationPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/forms-overview" 
            element={
              <ProtectedRoute>
                <FormsOverviewPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/reports/patient-medications" 
            element={
              <ProtectedRoute>
                <PatientMedicationsReportPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/reports/consultations" 
            element={
              <ProtectedRoute>
                <ConsultationReportPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/reports/drug-audit" 
            element={
              <ProtectedRoute>
                <DrugAuditReportPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/reports/patient-visits" 
            element={
              <ProtectedRoute>
                <PatientVisitsReportPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/reports/eye-tests-summary" 
            element={
              <ProtectedRoute>
                <EyeTestsSummaryReportPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/reports/medication-effectiveness" 
            element={
              <ProtectedRoute>
                <MedicationEffectivenessReportPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/patient/:patientId/progress" 
            element={
              <ProtectedRoute>
                <PatientProgressDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/reports/treatment-effectiveness" 
            element={
              <ProtectedRoute>
                <TreatmentEffectivenessReport />
              </ProtectedRoute>
            } 
          />
          <Route
            path="/reports/diseases"
            element={
              <ProtectedRoute>
                <DiseaseSpecificReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/revenue-analysis"
            element={
              <ProtectedRoute>
                <RevenueAnalysisReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/batch-tracking"
            element={
              <ProtectedRoute>
                <BatchTrackingReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/condition-prevalence"
            element={
              <ProtectedRoute>
                <ConditionPrevalenceReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/condition-outcomes"
            element={
              <ProtectedRoute>
                <ConditionOutcomesReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/protocol-adherence"
            element={
              <ProtectedRoute>
                <ProtocolAdherenceReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/referral-sources"
            element={
              <ProtectedRoute>
                <ReferralSourceReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/patient-outcomes"
            element={
              <ProtectedRoute>
                <PatientOutcomesReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patients/outcome/add"
            element={
              <ProtectedRoute>
                <PatientOutcomeForm />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/medicines/add" 
            element={
              <ProtectedRoute>
                <AddMedicinePage />
              </ProtectedRoute>
            } 
          />
          <Route
            path="/inventory/add"
            element={
              <ProtectedRoute>
                <Navigate to="/medications" replace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/treatments/add"
            element={
              <ProtectedRoute>
                <Navigate to="/patients" replace />
              </ProtectedRoute>
            }
          />
          
          {/* Protocol Routes */}
          <Route 
            path="/protocols" 
            element={
              <ProtectedRoute>
                <ProtocolsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/protocols/add" 
            element={
              <ProtectedRoute>
                <AddProtocolPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/protocols/builder" 
            element={
              <ProtectedRoute>
                <ProtocolBuilderPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/protocols/:id" 
            element={
              <ProtectedRoute>
                <ProtocolDetailPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/protocols/:id/edit" 
            element={
              <ProtectedRoute>
                <EditProtocolPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/protocols/assign/:patientId" 
            element={
              <ProtectedRoute>
                <AssignProtocolPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/protocols/assign" 
            element={
              <ProtectedRoute>
                <AssignProtocolPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/patient/:patientId/protocols" 
            element={
              <ProtectedRoute>
                <PatientProtocolsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/patient-protocols/:patientProtocolId/schedule" 
            element={
              <ProtectedRoute>
                <ProtocolSchedulePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/protocol-steps/:stepCompletionId/complete" 
            element={
              <ProtectedRoute>
                <CompleteProtocolStepPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/protocols/consent-forms" 
            element={
              <ProtectedRoute>
                <ConsentFormsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/patient/:patientId/consents" 
            element={
              <ProtectedRoute>
                <ConsentFormsPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Conditions Management Routes */}
          <Route 
            path="/conditions" 
            element={
              <ProtectedRoute>
                <ConditionsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/patients/:patientId/conditions" 
            element={
              <ProtectedRoute>
                <PatientConditionsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/patients/:patientId/conditions/add" 
            element={
              <ProtectedRoute>
                <AddPatientConditionPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/patient-conditions/:id" 
            element={
              <ProtectedRoute>
                <ConditionDetailPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/patient-conditions/:id/progress/add" 
            element={
              <ProtectedRoute>
                <AddConditionProgressPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Referrals Management Routes */}
          <Route 
            path="/referrals" 
            element={
              <ProtectedRoute>
                <ReferralsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/referrals/create" 
            element={
              <ProtectedRoute>
                <CreateReferralPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/referrals/overdue" 
            element={
              <ProtectedRoute>
                <ReferralsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/referrals/:id" 
            element={
              <ProtectedRoute>
                <ReferralDetailPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/referral-sources" 
            element={
              <ProtectedRoute>
                <ReferralSourcesPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/referral-sources/add" 
            element={
              <ProtectedRoute>
                <AddReferralSourcePage />
              </ProtectedRoute>
            } 
          />

          {/* Alert Management Routes */}
          <Route 
            path="/alerts" 
            element={
              <ProtectedRoute>
                <AlertCenter />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/alerts/:id" 
            element={
              <ProtectedRoute>
                <AlertDetailPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/alerts/followup" 
            element={
              <ProtectedRoute>
                <FollowUpAlertsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/alerts/return-due" 
            element={
              <ProtectedRoute>
                <ReturnDuePage />
              </ProtectedRoute>
            } 
          />
          
          {/* Patient-specific routes */}
          <Route 
            path="/patient/:patientId/consultations" 
            element={
              <ProtectedRoute>
                <ConsultationsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/patient/:patientId/consultations/add" 
            element={
              <ProtectedRoute>
                <AddConsultationPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/patient/:patientId/eye-tests" 
            element={
              <ProtectedRoute>
                <EyeTestsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/patient/:patientId/eye-tests/visual-acuity/add" 
            element={
              <ProtectedRoute>
                <AddVisualAcuityTestPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/patient/:patientId/eye-tests/refraction/add" 
            element={
              <ProtectedRoute>
                <AddRefractionTestPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/patient/:patientId/eye-tests/tonometry/add" 
            element={
              <ProtectedRoute>
                <AddTonometryTestPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/patient/:patientId/eye-tests/ophthalmoscopy/add" 
            element={
              <ProtectedRoute>
                <AddOphthalmoscopyPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/patient/:patientId/eye-tests/slit-lamp/add" 
            element={
              <ProtectedRoute>
                <AddSlitLampExamPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/patient/:patientId/eye-tests/visual-field/add" 
            element={
              <ProtectedRoute>
                <AddVisualFieldTestPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/patient/:patientId/eye-tests/oct/add" 
            element={
              <ProtectedRoute>
                <AddOCTScanPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/patient/:patientId/eye-tests/fluorescein/add" 
            element={
              <ProtectedRoute>
                <AddFluoresceinAngiographyPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/patient/:patientId/medications" 
            element={
              <ProtectedRoute>
                <MedicationsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/patient/:patientId/prescriptions/add" 
            element={
              <ProtectedRoute>
                <AddPrescriptionPage />
              </ProtectedRoute>
            } 
          />
        </Routes>
        </ErrorBoundary>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
