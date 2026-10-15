import { createBrowserRouter, Navigate } from 'react-router-dom';
import { SKIP_AUTH } from './lib/api/config';
import { AppLayout } from './components/layout/AppLayout';
import { Login } from './pages/Login';
import { RequireAuth } from './pages/RequireAuth';

export const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  // Role comes from the session, not the URL: /:page renders under the guard.
  {
    path: '/',
    element: (
      <RequireAuth>
        <AppLayout />
      </RequireAuth>
    ),
  },
  {
    path: '/:page',
    element: (
      <RequireAuth>
        <AppLayout />
      </RequireAuth>
    ),
  },
  { path: '*', element: <Navigate to={SKIP_AUTH ? '/' : '/login'} replace /> },
]);

