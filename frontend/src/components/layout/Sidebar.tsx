import { NavLink } from 'react-router-dom'

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-title">Practice Tracker</div>

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

        <NavLink to="/students" className="sidebar-link">
          Студенты
        </NavLink>
        <NavLink to="/groups" className="sidebar-link">
          Группы
        </NavLink>
        <NavLink to="/specialties" className="sidebar-link">
          Специальности
        </NavLink>
        <NavLink to="/enterprises" className="sidebar-link">
          Предприятия
        </NavLink>
        <NavLink to="/assignments" className="sidebar-link">
          Назначения
        </NavLink>
      </nav>
    </aside>
  )
}