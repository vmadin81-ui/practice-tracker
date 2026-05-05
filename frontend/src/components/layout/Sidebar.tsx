import { NavLink } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export function Sidebar() {
  const { user, logout } = useAuth()

  const canEditAssignments = user?.role === 'admin' || user?.role === 'practice_supervisor'
  const isAdmin = user?.role === 'admin'

  return (
    <aside className="sidebar">
      <div className="sidebar-title">Practice Tracker</div>

      <div className="sidebar-user-block">
        <div className="sidebar-user-name">{user?.full_name ?? user?.username}</div>
        <div className="sidebar-user-role">{user?.role}</div>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className="sidebar-link">
          Дашборд
        </NavLink>
        <NavLink to="/map" className="sidebar-link">
          Карта
        </NavLink>
        <NavLink to="/statuses" className="sidebar-link">
          Статусы
        </NavLink>
        <NavLink to="/geolocation-logs" className="sidebar-link">
          Журнал геолокации
        </NavLink>

        <div className="sidebar-section">Справочники</div>
        
        {isAdmin && (
          <NavLink to="/users" className="sidebar-link">
            Пользователи
          </NavLink>
        )}
        
        <NavLink to="/students" className="sidebar-link">
          Студенты
        </NavLink>
        
        {canEditAssignments && (
          <NavLink to="/student-access-links" className="sidebar-link">
            Ссылки check-in
          </NavLink>
        )}
        
        <NavLink to="/groups" className="sidebar-link">
          Группы
        </NavLink>
        
        {isAdmin && (
          <NavLink to="/specialties" className="sidebar-link">
            Специальности
          </NavLink>
        )}

        <NavLink to="/enterprises" className="sidebar-link">
          Предприятия
        </NavLink>

        {canEditAssignments && (
          <NavLink to="/assignments" className="sidebar-link">
            Назначения
          </NavLink>
        )}
        
        <NavLink to="/enterprise-summary" className="sidebar-link">
          Отчёт по предприятиям
        </NavLink>
      
      </nav>

      <div className="sidebar-footer">
        <button className="secondary-btn sidebar-logout-btn" onClick={logout}>
          Выйти
        </button>
      </div>
    </aside>
  )
}