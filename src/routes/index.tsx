import { createBrowserRouter, Navigate, RouterProvider, type RouteObject } from 'react-router-dom'
import Login from '../pages/Login'
import Signup from '../pages/Signup'
import ForgotPassword from '../pages/ForgotPassword'
import ResetPassword from '../pages/ResetPassword'
import VerifyEmail from '../pages/VerifyEmail'
import PublicRoute from './guards/PublicRoute'
import ProtectedRoute from './guards/ProtectedRoute'
import EmployeeRoute from './guards/EmployeeRoute'
import AppLayout from '../layouts/AppLayout'
import Employees from '../pages/Employees'
import Technicians from '../pages/Technicians'
import Customers from '../pages/Customers'
import ServiceRequests from '../pages/ServiceRequests'
import Schedules from '../pages/Schedules'
import Skills from '../pages/Skills'
import Settings from '../pages/Settings'

function RootRedirect() {
  return <Navigate to="/service-requests" replace />
}

function FallbackRedirect() {
  return <Navigate to="/service-requests" replace />
}

const STAFF_ADMIN_ROLES = ['OWNER', 'ORG_OWNER', 'ADMIN', 'ORG_ADMIN', 'MANAGER']
const SCHEDULE_ROLES = ['OWNER', 'ORG_OWNER', 'ADMIN', 'ORG_ADMIN', 'MANAGER', 'TECHNICIAN']
const SETTINGS_ROLES = ['OWNER', 'ORG_OWNER', 'ADMIN', 'ORG_ADMIN', 'MANAGER', 'CUSTOMER']

const routes: RouteObject[] = [
  {
    path: '/auth',
    children: [
      {
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
          {
            path: 'forgot-password',
            element: <ForgotPassword />,
          },
        ],
      },
      {
        path: 'reset-password',
        element: <ResetPassword />,
      },
      {
        path: 'verify-email',
        element: <VerifyEmail />,
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
    path: '/forgot-password',
    element: <ForgotPassword />,
  },
  {
    path: '/reset-password',
    element: <ResetPassword />,
  },
  {
    path: '/verify-email',
    element: <VerifyEmail />,
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
          <EmployeeRoute allowedRoles={STAFF_ADMIN_ROLES}>
            <Employees />
          </EmployeeRoute>
        ),
      },
      {
        path: 'technicians',
        element: (
          <EmployeeRoute allowedRoles={STAFF_ADMIN_ROLES}>
            <Technicians />
          </EmployeeRoute>
        ),
      },
      {
        path: 'customers',
        element: (
          <EmployeeRoute allowedRoles={STAFF_ADMIN_ROLES}>
            <Customers />
          </EmployeeRoute>
        ),
      },
      {
        path: 'service-requests',
        element: <ServiceRequests />
      },
      {
        path: 'schedules',
        element: (
          <EmployeeRoute allowedRoles={SCHEDULE_ROLES}>
            <Schedules />
          </EmployeeRoute>
        ),
      },
      {
        path: 'services',
        element: <Navigate to="/service-requests" replace />
      },
      {
        path: 'skills',
        element: (
          <EmployeeRoute allowedRoles={STAFF_ADMIN_ROLES}>
            <Skills />
          </EmployeeRoute>
        ),
      },
      {
        path: 'settings',
        element: (
          <EmployeeRoute allowedRoles={SETTINGS_ROLES}>
            <Settings />
          </EmployeeRoute>
        ),
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
