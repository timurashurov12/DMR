import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { LocaleProvider } from '@/shared/context/LocaleContext';
import { Layout } from '@/shared/components/Layout';
import { HomePage } from '@/features/home/pages/HomePage';
import { MenuPage } from '@/features/menu/pages/MenuPage';
import { AuthProvider, useAuth } from '@/features/admin/context/AuthContext';
import { LoginPage } from '@/features/admin/pages/LoginPage';
import { DashboardLayout } from '@/features/admin/components/DashboardLayout';
import { MenuTypesPage } from '@/features/admin/pages/MenuTypesPage';
import { CategoriesPage } from '@/features/admin/pages/CategoriesPage';
import { MenuItemsPage } from '@/features/admin/pages/MenuItemsPage';
import { SettingsPage } from '@/features/admin/pages/SettingsPage';

function AdminPrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) return <Navigate to="/admin/login" state={{ from: location }} replace />;
  return <>{children}</>;
}

function AdminRoutes() {
  return (
    <AuthProvider>
      <Routes>
        <Route index element={<Navigate to="/admin/menu-types" replace />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="menu-types" element={<AdminPrivateRoute><DashboardLayout /></AdminPrivateRoute>}>
          <Route index element={<MenuTypesPage />} />
        </Route>
        <Route path="categories" element={<AdminPrivateRoute><DashboardLayout /></AdminPrivateRoute>}>
          <Route index element={<CategoriesPage />} />
        </Route>
        <Route path="menu-items" element={<AdminPrivateRoute><DashboardLayout /></AdminPrivateRoute>}>
          <Route index element={<MenuItemsPage />} />
        </Route>
        <Route path="settings" element={<AdminPrivateRoute><DashboardLayout /></AdminPrivateRoute>}>
          <Route index element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default function App() {
  return (
    <LocaleProvider>
      <Routes>
        <Route path="/admin/*" element={<AdminRoutes />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="menu/:menuTypeId" element={<MenuPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </LocaleProvider>
  );
}
