import { createBrowserRouter, Navigate, RouterProvider, type RouteObject } from 'react-router-dom'
import Login from '../pages/Login'
import Signup from '../pages/Signup'
import { PublicRoute } from './guards'

const routes: RouteObject[] = [
  {
    path: '/auth',
    element: <PublicRoute />,
    children: [
      {
        index: true,
        element: <Navigate to="/auth/login" replace />,
      },
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'signup',
        element: <Signup />,
      },
    ],
  },
  {
    path: '/',
    element: <Navigate to="/auth/login" replace />,
  },
  {
    path: '*',
    element: <Navigate to="/auth/login" replace />,
  },
]

const router = createBrowserRouter(routes)

export default function AppRoutes() {
  return <RouterProvider router={router} />
}
