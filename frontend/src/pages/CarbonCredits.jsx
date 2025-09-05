import { useState, useEffect } from 'react'
import { carbonAPI, farmsAPI } from '../services/api'
import CarbonDashboard from '../components/CarbonDashboard'
import VerificationQueue from '../components/VerificationQueue'

const CarbonCredits = () => {
  const [selectedFarm, setSelectedFarm] = useState(null)
  const [farms, setFarms] = useState([])
  const [carbonData, setCarbonData] = useState({})
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const farmsResponse = await farmsAPI.getAll()
        setFarms(farmsResponse.data.data.farms)
        
        if (farmsResponse.data.data.farms.length > 0) {
          setSelectedFarm(farmsResponse.data.data.farms[0]._id)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    if (selectedFarm) {
      const fetchCarbonData = async () => {
        try {
          const response = await carbonAPI.getForFarm(selectedFarm)
          setCarbonData(response.data)
        } catch (error) {
          console.error('Error fetching carbon data:', error)
        }
      }

      fetchCarbonData()
    }
  }, [selectedFarm])

  if (loading) {
    return <div>Loading carbon data...</div>
  }

  return (
    <div className="carbon-credits-page">
      <div className="page-header">
        <h1>Carbon Credits</h1>
        <div className="tabs">
          <button 
            className={activeTab === 'overview' ? 'active' : ''}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={activeTab === 'verification' ? 'active' : ''}
            onClick={() => setActiveTab('verification')}
          >
            Verification
          </button>
        </div>
      </div>

      <div className="farm-selector">
        <label htmlFor="farm-select">Select Farm:</label>
        <select 
          id="farm-select"
          value={selectedFarm || ''}
          onChange={(e) => setSelectedFarm(e.target.value)}
        >
          {farms.map(farm => (
            <option key={farm._id} value={farm._id}>
              {farm.name}
            </option>
          ))}
        </select>
      </div>

      {activeTab === 'overview' && selectedFarm && (
        <CarbonDashboard farmId={selectedFarm} data={carbonData} />
      )}

      {activeTab === 'verification' && (
        <VerificationQueue />
      )}
    </div>
  )
}

export default CarbonCredits