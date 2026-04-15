import { createBrowserRouter, Navigate, Outlet, RouterProvider } from 'react-router-dom';
import AuthPage from './pages/Auth.page';
import BoardPage from './pages/Board.page';
import ProjectsPage from './pages/Projects.page';
import { isLoggedIn } from '@/lib/pocketbase';

export function ProtectedRoute() {
  if (!isLoggedIn()) {
    return <Navigate to="/auth" replace />;
  }

  return <Outlet />;
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/auth" replace />,
  },
  {
    path: 'auth',
    element: <AuthPage />,
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        path: 'projects',
        element: <ProjectsPage />,
      },
      {
        path: 'projects/:projectId',
        element: <BoardPage />,
      },
    ],
  },
]);

export function Router() {
  return <RouterProvider router={router} />;
}
