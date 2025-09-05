import { Link, useLocation } from 'react-router-dom'
import './Sidebar.css'

const Sidebar = () => {
  const location = useLocation()

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/farms', label: 'Farms', icon: '🌾' },
    { path: '/carbon-credits', label: 'Carbon Credits', icon: '🌍' },
    { path: '/verification', label: 'Verification', icon: '✅' },
  ]

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>MRV Solutions</h2>
      </div>
      <nav className="sidebar-nav">
        <ul>
          {menuItems.map(item => (
            <li key={item.path}>
              <Link 
                to={item.path} 
                className={location.pathname === item.path ? 'active' : ''}
              >
                <span className="icon">{item.icon}</span>
                <span className="label">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}

export default Sidebar