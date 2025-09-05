import { useState, useEffect } from 'react'
import { farmsAPI, carbonAPI } from '../services/api'
import StatsGrid from '../components/StatsGrid'
import CarbonChart from '../components/CarbonChart'
import RecentActivity from '../components/RecentActivity'

const Dashboard = () => {
  const [stats, setStats] = useState({})
  const [carbonData, setCarbonData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [farmsResponse, carbonResponse] = await Promise.all([
          farmsAPI.getStats(),
          carbonAPI.getPending()
        ])
        
        setStats(farmsResponse.data)
        setCarbonData(carbonResponse.data)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return <div>Loading dashboard...</div>
  }

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <StatsGrid stats={stats} />
      <div className="dashboard-charts">
        <div className="chart-section">
          <CarbonChart data={carbonData} />
        </div>
        <div className="activity-section">
          <RecentActivity />
        </div>
      </div>
    </div>
  )
}

export default Dashboard