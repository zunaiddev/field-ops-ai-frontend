import { createBrowserRouter, Navigate, RouterProvider, type RouteObject } from 'react-router-dom'
import Login from '../pages/Login'
import Signup from '../pages/Signup'
import PublicRoute from './guards/PublicRoute'
import ProtectedRoute from './guards/ProtectedRoute'
import EmployeeRoute from './guards/EmployeeRoute'
import AppLayout from '../layouts/AppLayout'
import Employees from '../pages/Employees'
import Technicians from '../pages/Technicians'
import Customers from '../pages/Customers'
import ServiceRequests from '../pages/ServiceRequests'
import Skills from '../pages/Skills'
import Settings from '../pages/Settings'

function RootRedirect() {
  return <Navigate to="/service-requests" replace />
}

function FallbackRedirect() {
  return <Navigate to="/service-requests" replace />
}

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
        element: <Login mode="customer" />,
      },
      {
        path: 'login/employee',
        element: <Login mode="employee" />,
      },
      {
        path: 'login/customer',
        element: <Navigate to="/auth/login" replace />,
      },
      {
        path: 'signup',
        element: <Signup />,
      },
    ],
  },
  {
    path: '/login',
    element: <PublicRoute />,
    children: [
      {
        index: true,
        element: <Login mode="customer" />,
      },
      {
        path: 'employee',
        element: <Login mode="employee" />,
      },
      {
        path: 'customer',
        element: <Navigate to="/login" replace />,
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
        element: <RootRedirect />,
      },
      {
        path: 'employees',
        element: (
          <EmployeeRoute>
            <Employees />
          </EmployeeRoute>
        ),
      },
      {
        path: 'technicians',
        element: (
          <EmployeeRoute>
            <Technicians />
          </EmployeeRoute>
        ),
      },
      {
        path: 'customers',
        element: (
          <EmployeeRoute>
            <Customers />
          </EmployeeRoute>
        ),
      },
      {
        path: 'service-requests',
        element: <ServiceRequests />,
      },
      {
        path: 'services',
        element: <Navigate to="/service-requests" replace />,
      },
      {
        path: 'skills',
        element: (
          <EmployeeRoute>
            <Skills />
          </EmployeeRoute>
        ),
      },
      {
        path: 'settings',
        element: <Settings />,
      },
    ],
  },
  {
    path: '*',
    element: <FallbackRedirect />,
  },
]

const router = createBrowserRouter(routes)

export default function AppRoutes() {
  return <RouterProvider router={router} />
}
