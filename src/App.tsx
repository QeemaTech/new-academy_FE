import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import PublicLayout from './layouts/PublicLayout';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Public Pages
import Home from './pages/public/Home';
import Programs from './pages/public/Programs';
import ProgramDetail from './pages/public/ProgramDetail';
import Pricing from './pages/public/Pricing';
import Blog from './pages/public/Blog';
import BlogPost from './pages/public/BlogPost';
import Competitions from './pages/public/Competitions';
import About from './pages/public/About';
import Contact from './pages/public/Contact';
import FreeTrial from './pages/public/FreeTrial';
import PrivacyPolicy from './pages/public/PrivacyPolicy';
import TermsPolicy from './pages/public/TermsPolicy';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';

// Parent Pages
import ParentDashboard from './pages/parent/Dashboard';
import ParentChildren from './pages/parent/Children';
import ParentReports from './pages/parent/Reports';
import ParentPayments from './pages/parent/Payments';
import ParentSupport from './pages/parent/Support';
import ParentSettings from './pages/parent/Settings';
import ParentStore from './pages/parent/Store';
import ParentChildDetail from './pages/parent/ChildDetail';
import ParentCheckout from './pages/parent/Checkout';

// Student Pages (بوابة البطل)
import StudentLayout from './layouts/StudentLayout';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentTracks from './pages/student/StudentTracks';
import TrackView from './pages/student/TrackView';
import LearningRoom from './pages/student/LearningRoom';
import Achievements from './pages/student/Achievements';
import StudentSettings from './pages/student/Settings';
import StudyPlannerPage from './pages/student/StudyPlanner';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminProgramsPage from './pages/admin/AdminProgramsPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminBundlesPage from './pages/admin/AdminBundlesPage';
import AdminCouponsPage from './pages/admin/AdminCouponsPage';
import AdminChildrenPage from './pages/admin/AdminChildrenPage';
import AdminSessionsPage from './pages/admin/AdminSessionsPage';
import AdminSubscriptionsPage from './pages/admin/AdminSubscriptionsPage';
import AdminPaymentsPage from './pages/admin/AdminPaymentsPage';
import AdminReports from './pages/admin/Reports';
import AdminTicketsPage from './pages/admin/AdminTicketsPage';
import AdminQuizzesPage from './pages/admin/AdminQuizzesPage';
import AdminRolesPage from './pages/admin/AdminRolesPage';
import AdminPerformancePage from './pages/admin/AdminPerformancePage';
import AdminAllAssessmentsPage from './pages/admin/AdminAllAssessmentsPage';
import AdminCMSPage from './pages/admin/AdminCMSPage';
import AdminContentPage from './pages/admin/AdminContentPage';
import AdminCertificatesPage from './pages/admin/AdminCertificatesPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import AdminProfilePage from './pages/admin/AdminProfilePage';

// Teacher portal
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TeacherTracksPage from './pages/teacher/TeacherTracksPage';
import TeacherTrackRoadmapPage from './pages/teacher/TeacherTrackRoadmapPage';
import TeacherStudentsPage from './pages/teacher/TeacherStudentsPage';
import TeacherStudentDetailsPage from './pages/teacher/TeacherStudentDetailsPage';
import TeacherSettingsPage from './pages/teacher/TeacherSettingsPage';
import TeacherAvailabilityPage from './pages/teacher/TeacherAvailabilityPage';

// Protected Route Component (Zustand + JWT; roles are lowercased from API)
function ProtectedRoute({ children, allowedRoles }: { children: JSX.Element; allowedRoles: string[] }) {
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated || !user) {
    const redirect = encodeURIComponent(`${location.pathname}${location.search}`);
    return <Navigate to={`/auth/login?redirect=${redirect}`} replace />;
  }
  const r = user.role.toLowerCase();
  const allowed = allowedRoles.map((x) => x.toLowerCase());
  if (!allowed.includes(r)) {
    return <Navigate to="/ar" replace />;
  }
  return children;
}

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Navigate to="/ar" replace />} />
      <Route path="/ar" element={<PublicLayout />}>
        <Route index element={<Home />} />
        <Route path="programs" element={<Programs />} />
        <Route path="programs/:id" element={<ProgramDetail />} />
        <Route path="pricing" element={<Pricing />} />
        <Route path="blog" element={<Blog />} />
        <Route path="blog/:slug" element={<BlogPost />} />
        <Route path="competitions" element={<Competitions />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="free-trial" element={<FreeTrial />} />
        <Route path="policies/privacy" element={<PrivacyPolicy />} />
        <Route path="policies/terms" element={<TermsPolicy />} />
      </Route>

      {/* Auth Routes */}
      <Route path="/auth" element={<AuthLayout />}>
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="forgot" element={<ForgotPassword />} />
      </Route>

      {/* Parent Routes */}
      <Route
        path="/parent"
        element={
          <ProtectedRoute allowedRoles={['parent']}>
            <DashboardLayout role="parent" />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<ParentDashboard />} />
        <Route path="checkout" element={<ParentCheckout />} />
        <Route path="children" element={<ParentChildren />} />
        <Route path="children/:childId" element={<ParentChildDetail />} />
        <Route path="reports" element={<ParentReports />} />
        <Route path="payments" element={<ParentPayments />} />
        <Route path="store" element={<ParentStore />} />
        <Route path="support" element={<ParentSupport />} />
        <Route path="settings" element={<ParentSettings />} />
      </Route>

      {/* Teacher portal — hybrid linear curriculum */}
      <Route
        path="/teacher"
        element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <DashboardLayout role="teacher" />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="tracks" replace />} />
        <Route path="dashboard" element={<TeacherDashboard />} />
        <Route path="students" element={<TeacherStudentsPage />} />
        <Route path="students/:childId" element={<TeacherStudentDetailsPage />} />
        <Route path="tracks" element={<TeacherTracksPage />} />
        <Route path="tracks/:trackId" element={<TeacherTrackRoadmapPage />} />
        <Route path="availability" element={<TeacherAvailabilityPage />} />
        <Route path="settings" element={<TeacherSettingsPage />} />
      </Route>

      {/* Student Routes — بوابة البطل */}
      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRoles={['student', 'child']}>
            <StudentLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="planner" element={<StudyPlannerPage />} />
        <Route path="tracks" element={<StudentTracks />} />
        <Route path="tracks/:id" element={<TrackView />} />
        <Route path="lessons/:id" element={<LearningRoom />} />
        <Route path="certificates" element={<Achievements />} />
        <Route path="settings" element={<StudentSettings />} />
      </Route>

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin', 'staff', 'super_admin']}>
            <DashboardLayout role="admin" />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="programs" element={<AdminProgramsPage />} />
        <Route path="categories" element={<AdminCategoriesPage />} />
        <Route path="bundles" element={<AdminBundlesPage />} />
        <Route path="coupons" element={<AdminCouponsPage />} />
        <Route path="children" element={<AdminChildrenPage />} />
        <Route path="sessions" element={<AdminSessionsPage />} />
        <Route path="subscriptions" element={<AdminSubscriptionsPage />} />
        <Route path="payments" element={<AdminPaymentsPage />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="assessments" element={<AdminAllAssessmentsPage />} />
        <Route path="assessments/performance/:childId" element={<AdminPerformancePage />} />
        <Route path="support" element={<AdminTicketsPage />} />
        <Route path="quizzes" element={<AdminQuizzesPage />} />
        <Route path="roles" element={<AdminRolesPage />} />
        <Route path="content" element={<AdminContentPage />} />
        <Route path="cms" element={<AdminCMSPage />} />
        <Route path="certificates" element={<AdminCertificatesPage />} />
        <Route path="profile" element={<AdminProfilePage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/ar" replace />} />
    </Routes>
  );
}

export default App;

