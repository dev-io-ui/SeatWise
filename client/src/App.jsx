import { Navigate, Route, Routes } from "react-router-dom";
import AuthPage from "./pages/AuthPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import useAuthStore from "./store/useAuthStore.js";

const AppLoader = () => (
  <div className="flex min-h-screen items-center justify-center px-4">
    <div className="rounded-4xl border border-line bg-white/90 px-8 py-6 text-center shadow-panel">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">SeatFlow</p>
      <p className="mt-3 text-sm text-muted">Loading secure admin session...</p>
    </div>
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { token, hasHydrated } = useAuthStore((state) => ({
    token: state.token,
    hasHydrated: state.hasHydrated,
  }));

  if (!hasHydrated) {
    return <AppLoader />;
  }

  if (!token) {
    return <Navigate to="/auth" replace />;
  }

  return children;
};

const PublicRoute = ({ children }) => {
  const { token, hasHydrated } = useAuthStore((state) => ({
    token: state.token,
    hasHydrated: state.hasHydrated,
  }));

  if (!hasHydrated) {
    return <AppLoader />;
  }

  if (token) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default function App() {
  return (
    <Routes>
      <Route
        path="/auth"
        element={
          <PublicRoute>
            <AuthPage />
          </PublicRoute>
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
