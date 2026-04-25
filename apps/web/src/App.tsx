import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/features/admin/context/AuthContext';
import { RestaurantProvider } from '@/features/admin/context/RestaurantContext';
import { DashboardLayout } from '@/features/admin/components/DashboardLayout';
import { MenuTypesPage } from '@/features/admin/pages/MenuTypesPage';
import { CategoriesPage } from '@/features/admin/pages/CategoriesPage';
import { MenuItemsPage } from '@/features/admin/pages/MenuItemsPage';
import { SettingsPage } from '@/features/admin/pages/SettingsPage';
import { MenusPage } from '@/features/admin/pages/MenusPage';
import { BookingsAdminPage } from '@/features/admin/pages/BookingsAdminPage';
import { DepartmentsPage } from '@/features/admin/pages/DepartmentsPage';
import { LandingPage } from '@/features/landing/pages/LandingPage';
import { RegisterPage } from '@/features/landing/pages/RegisterPage';
import { LandingLoginPage } from '@/features/landing/pages/LoginPage';

function AdminPrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  return <>{children}</>;
}

function AdminRoutes() {
  return (
    <AuthProvider>
      <RestaurantProvider>
      <Routes>
        <Route index element={<Navigate to="/admin/menu-types" replace />} />
        <Route path="menus" element={<AdminPrivateRoute><DashboardLayout /></AdminPrivateRoute>}>
          <Route index element={<MenusPage />} />
        </Route>
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
        <Route path="bookings" element={<AdminPrivateRoute><DashboardLayout /></AdminPrivateRoute>}>
          <Route index element={<BookingsAdminPage />} />
        </Route>
        <Route path="departments" element={<AdminPrivateRoute><DashboardLayout /></AdminPrivateRoute>}>
          <Route index element={<DepartmentsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
      </RestaurantProvider>
    </AuthProvider>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LandingLoginPage />} />
      <Route path="/admin/*" element={<AdminRoutes />} />
      <Route path="/" element={<LandingPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}