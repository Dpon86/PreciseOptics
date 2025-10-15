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
  // Patient Management
  PatientsPage,
  AddPatientPage,
  AddDiagnosisPage,
  AddTreatmentPage,
  // Consultation Management
  ConsultationsPage,
  AddConsultationPage,
  ConsultationDetailPage,
  // Eye Tests
  EyeTestsPage,
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
  AddMedicationPage,
  AddMedicinePage,
  AddPrescriptionPage,
  // Reports
  PatientMedicationsReportPage,
  ConsultationReportPage,
  DrugAuditReportPage,
  PatientVisitsReportPage,
  EyeTestsSummaryReportPage,
  MedicationEffectivenessReportPage,
  PatientProgressDashboard,
  // Audit
  AuditLogsPage,
  AddAuditLogPage,
  // System
  SystemPage,
  ManageStaffPage,
  AddStaffPage,
  AddSpecializationPage,
  FormsOverviewPage
} from './pages';
import AdminDashboard from './pages/AdminDashboard';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import './App_new.css';

// Protected Route Component with Patient Context
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Wrap authenticated content with PatientProvider
  return (
    <PatientProvider>
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
            path="/patients/add" 
            element={
              <ProtectedRoute>
                <AddPatientPage />
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
            path="/prescriptions/add" 
            element={
              <ProtectedRoute>
                <AddPrescriptionPage />
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
            path="/specializations" 
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
            path="/medicines/add" 
            element={
              <ProtectedRoute>
                <AddMedicinePage />
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
