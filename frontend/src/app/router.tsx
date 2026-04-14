import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
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

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'map', element: <MapPage /> },
      { path: 'statuses', element: <DailyStatusesPage /> },
      { path: 'geolocation-logs', element: <GeolocationLogsPage /> },

      { path: 'students', element: <StudentsPage /> },
      { path: 'students/:studentId', element: <StudentDetailsPage /> },
      { path: 'groups', element: <GroupsPage /> },
      { path: 'specialties', element: <SpecialtiesPage /> },
      { path: 'enterprises', element: <EnterprisesPage /> },
      { path: 'assignments', element: <PracticeAssignmentsPage /> },
    ],
  },
])