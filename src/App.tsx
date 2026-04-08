import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { Toaster } from 'sonner';
import { Navbar, Footer } from './components/layout/NavbarFooter';
import { FirebaseInitializer } from './components/FirebaseInitializer';
import Home from './pages/Home';
import ActivityDetail from './pages/ActivityDetail';
import Archives from './pages/Archives';
import Login from './pages/Login';
import AdminLayout, { AdminDashboard } from './pages/admin/AdminLayout';
import ManageReservations from './pages/admin/ManageReservations';
import ManageServices from './pages/admin/ManageServices';
import ManageLeSaviezVous from './pages/admin/ManageLeSaviezVous';
import ManageMedia from './pages/admin/ManageMedia';
import ManageVerbatims from './pages/admin/ManageVerbatims';
import ManageContacts from './pages/admin/ManageContacts';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <FirebaseInitializer />
        <Router>
          <div className="flex flex-col min-h-screen font-sans">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/activity/:id" element={<ActivityDetail />} />
                <Route path="/archives" element={<Archives />} />
                <Route path="/login" element={<Login />} />

                {/* Admin Routes */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="reservations" element={<ManageReservations />} />
                  <Route path="services" element={<ManageServices />} />
                  <Route path="le-saviez-vous" element={<ManageLeSaviezVous />} />
                  <Route path="media" element={<ManageMedia />} />
                  <Route path="verbatims" element={<ManageVerbatims />} />
                  <Route path="contacts" element={<ManageContacts />} />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
          <Toaster position="top-center" richColors />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}
