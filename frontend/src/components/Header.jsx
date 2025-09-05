import { useAuth } from '../contexts/AuthContext'
import './Header.css'

const Header = () => {
  const { user, logout } = useAuth()

  return (
    <header className="header">
      <div className="header-content">
        <h1>Carbon Credit Management</h1>
        <div className="user-menu">
          <span>Welcome, {user?.name}</span>
          <button onClick={logout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header