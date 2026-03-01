import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Index from '@/pages/Index';
import StudentLogin from '@/pages/StudentLogin';
import StudentRegister from '@/pages/StudentRegister';
import AdminLogin from '@/pages/AdminLogin';
import StudentDashboard from '@/pages/StudentDashboard';
import AdminDashboard from '@/pages/AdminDashboard';
import NewComplaint from '@/pages/NewComplaint';
import NotFound from '@/pages/NotFound';
import { Toaster } from '@/components/ui/toaster';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<StudentLogin />} />
          <Route path="/register" element={<StudentRegister />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          
          {/* Protected Routes */}
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/new-complaint"
            element={
              <ProtectedRoute>
                <NewComplaint />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;