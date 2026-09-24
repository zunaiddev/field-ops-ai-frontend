import { createBrowserRouter, Navigate, RouterProvider, type RouteObject } from 'react-router-dom'
import Login from '../pages/Login'
import Signup from '../pages/Signup'
import PublicRoute from './guards/PublicRoute'
import ProtectedRoute from './guards/ProtectedRoute'
import AppLayout from '../layouts/AppLayout'
import Dashboard from '../pages/Dashboard'
import Employees from '../pages/Employees'
import Technicians from '../pages/Technicians'
import Customers from '../pages/Customers'
import ServiceRequests from '../pages/ServiceRequests'
import Jobs from '../pages/Jobs'
import Skills from '../pages/Skills'
import Settings from '../pages/Settings'

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
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'employees',
        element: <Employees />,
      },
      {
        path: 'technicians',
        element: <Technicians />,
      },
      {
        path: 'customers',
        element: <Customers />,
      },
      {
        path: 'service-requests',
        element: <ServiceRequests />,
      },
      {
        path: 'jobs',
        element: <Jobs />,
      },
      {
        path: 'skills',
        element: <Skills />,
      },
      {
        path: 'settings',
        element: <Settings />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
]

const router = createBrowserRouter(routes)

export default function AppRoutes() {
  return <RouterProvider router={router} />
}
