import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import { ProtectedRoute } from '../components/auth/ProtectedRoute'
import { DashboardPage } from '../pages/DashboardPage'
import { MapPage } from '../pages/MapPage'
import { DailyStatusesPage } from '../pages/DailyStatusesPage'
import { StudentsPage } from '../pages/StudentsPage'
import { GroupsPage } from '../pages/GroupsPage'
import { EnterprisesPage } from '../pages/EnterprisesPage'
import { PracticeAssignmentsPage } from '../pages/PracticeAssignmentsPage'
import { SpecialtiesPage } from '../pages/SpecialtiesPage'
import { GeolocationLogsPage } from '../pages/GeolocationLogsPage'
import { StudentDetailsPage } from '../pages/StudentDetailsPage'
import { LoginPage } from '../pages/LoginPage'
import { UsersPage } from '../pages/UsersPage'
import { StudentCheckinPage } from '../pages/StudentCheckinPage'
import { StudentCheckinStartPage } from '../pages/StudentCheckinStartPage'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },

  {
    path: '/student-checkin/start',
    element: <StudentCheckinStartPage />,
  },
  {
    path: '/student-checkin',
    element: <StudentCheckinPage />,
  },

  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },

      {
        path: 'dashboard',
        element: (
          <ProtectedRoute allowedRoles={['admin', 'practice_supervisor', 'viewer']}>
            <DashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'map',
        element: (
          <ProtectedRoute allowedRoles={['admin', 'practice_supervisor', 'viewer']}>
            <MapPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'statuses',
        element: (
          <ProtectedRoute allowedRoles={['admin', 'practice_supervisor', 'viewer']}>
            <DailyStatusesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'geolocation-logs',
        element: (
          <ProtectedRoute allowedRoles={['admin', 'practice_supervisor', 'viewer']}>
            <GeolocationLogsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'students',
        element: (
          <ProtectedRoute allowedRoles={['admin', 'practice_supervisor', 'viewer']}>
            <StudentsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'students/:studentId',
        element: (
          <ProtectedRoute allowedRoles={['admin', 'practice_supervisor', 'viewer']}>
            <StudentDetailsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'groups',
        element: (
          <ProtectedRoute allowedRoles={['admin', 'practice_supervisor', 'viewer']}>
            <GroupsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'specialties',
        element: (
          <ProtectedRoute allowedRoles={['admin']}>
            <SpecialtiesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'enterprises',
        element: (
          <ProtectedRoute allowedRoles={['admin', 'practice_supervisor', 'viewer']}>
            <EnterprisesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'assignments',
        element: (
          <ProtectedRoute allowedRoles={['admin', 'practice_supervisor']}>
            <PracticeAssignmentsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'users',
        element: (
          <ProtectedRoute allowedRoles={['admin']}>
            <UsersPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
])