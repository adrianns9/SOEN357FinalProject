import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { HomePage } from './pages/Home.page';
import AuthPage from './pages/Auth.page';
import { BoardPage } from './components';

const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/login',
    element: <AuthPage />,
  },
  {
    path: '/board',
    element: <BoardPage />,
  },
]);

export function Router() {
  return <RouterProvider router={router} />;
}
