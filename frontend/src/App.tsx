import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/admin/DashboardPage";
import OutletsPage from "./pages/admin/OutletsPage";
import UsersPage from "./pages/admin/UsersPage";
import ProductsPage from "./pages/admin/ProductsPage";
import HistoryPage from "./pages/admin/HistoryPage";
import StaffHomePage from "./pages/staff/StaffHomePage";
import ScanPage from "./pages/staff/ScanPage";
import StockEntryPage from "./pages/staff/StockEntryPage";

function RequireAuth({ children, role }: { children: JSX.Element; role?: string }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === "ADMIN" ? "/admin/dashboard" : "/staff"} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/admin/dashboard" element={<RequireAuth role="ADMIN"><DashboardPage /></RequireAuth>} />
          <Route path="/admin/outlets" element={<RequireAuth role="ADMIN"><OutletsPage /></RequireAuth>} />
          <Route path="/admin/users" element={<RequireAuth role="ADMIN"><UsersPage /></RequireAuth>} />
          <Route path="/admin/products" element={<RequireAuth role="ADMIN"><ProductsPage /></RequireAuth>} />
          <Route path="/admin/history" element={<RequireAuth role="ADMIN"><HistoryPage /></RequireAuth>} />
          <Route path="/staff" element={<RequireAuth role="STAFF"><StaffHomePage /></RequireAuth>} />
          <Route path="/staff/scan" element={<RequireAuth role="STAFF"><ScanPage /></RequireAuth>} />
          <Route path="/staff/entry" element={<RequireAuth role="STAFF"><StockEntryPage /></RequireAuth>} />
          <Route path="/" element={<RootRedirect />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
