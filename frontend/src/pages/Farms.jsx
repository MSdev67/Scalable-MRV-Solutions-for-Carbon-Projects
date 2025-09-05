import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { farmsAPI } from '../services/api'
import FarmMap from '../components/FarmMap'
import './Farms.css'

const Farms = () => {
  const [farms, setFarms] = useState([])
  const [loading, setLoading] = useState(true)
  const [showMap, setShowMap] = useState(false)

  useEffect(() => {
    const fetchFarms = async () => {
      try {
        const response = await farmsAPI.getAll()
        setFarms(response.data.data.farms)
      } catch (error) {
        console.error('Error fetching farms:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchFarms()
  }, [])

  if (loading) {
    return <div>Loading farms...</div>
  }

  return (
    <div className="farms-page">
      <div className="page-header">
        <h1>My Farms</h1>
        <div className="header-actions">
          <button 
            onClick={() => setShowMap(!showMap)} 
            className="toggle-map-btn"
          >
            {showMap ? 'Show List' : 'Show Map'}
          </button>
          <Link to="/farms/new" className="btn-primary">
            Add New Farm
          </Link>
        </div>
      </div>

      {showMap ? (
        <FarmMap farms={farms} />
      ) : (
        <div className="farms-list">
          {farms.length === 0 ? (
            <div className="empty-state">
              <p>No farms found. Add your first farm to get started.</p>
            </div>
          ) : (
            <div className="farms-grid">
              {farms.map(farm => (
                <div key={farm._id} className="farm-card">
                  <h3>{farm.name}</h3>
                  <p><strong>Area:</strong> {farm.area} hectares</p>
                  <p><strong>Crop Type:</strong> {farm.cropType}</p>
                  <p><strong>Practices:</strong> {farm.practices.join(', ')}</p>
                  <Link to={`/farms/${farm._id}`} className="btn-secondary">
                    View Details
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Farms
