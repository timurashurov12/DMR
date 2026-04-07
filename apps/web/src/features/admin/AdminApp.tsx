import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/features/admin/context/AuthContext';
import { LoginPage } from '@/features/admin/pages/LoginPage';
import { DashboardLayout } from '@/features/admin/components/DashboardLayout';
import { MenuTypesPage } from '@/features/admin/pages/MenuTypesPage';
import { CategoriesPage } from '@/features/admin/pages/CategoriesPage';
import { MenuItemsPage } from '@/features/admin/pages/MenuItemsPage';
import { SettingsPage } from '@/features/admin/pages/SettingsPage';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) return <Navigate to="/admin/login" state={{ from: location }} replace />;
  return <>{children}</>;
}

export function AdminApp() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/admin/login" element={<LoginPage />} />
        <Route
          path="/admin/*"
          element={
            <PrivateRoute>
              <DashboardLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="menu-types" replace />} />
          <Route path="menu-types" element={<MenuTypesPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="menu-items" element={<MenuItemsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </AuthProvider>
  );
}
