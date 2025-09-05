import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { farmsAPI, carbonAPI, satelliteAPI } from '../services/api';
import CarbonDashboard from '../components/CarbonDashboard';
import FarmMap from '../components/FarmMap';
import './FarmDetail.css';

const FarmDetail = () => {
  const { id } = useParams();
  const [farm, setFarm] = useState(null);
  const [carbonData, setCarbonData] = useState(null);
  const [satelliteData, setSatelliteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [farmResponse, carbonResponse, satelliteResponse] = await Promise.all([
          farmsAPI.getById(id),
          carbonAPI.getForFarm(id),
          satelliteAPI.getForFarm(id)
        ]);
        
        setFarm(farmResponse.data.data.farm);
        setCarbonData(carbonResponse.data);
        setSatelliteData(satelliteResponse.data);
      } catch (error) {
        console.error('Error fetching farm data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleCalculateCredits = async () => {
    try {
      await carbonAPI.calculate(id);
      // Refresh carbon data
      const carbonResponse = await carbonAPI.getForFarm(id);
      setCarbonData(carbonResponse.data);
      alert('Carbon credits calculated successfully!');
    } catch (error) {
      alert('Error calculating carbon credits: ' + error.response?.data?.message);
    }
  };

  if (loading) {
    return <div className="loading">Loading farm details...</div>;
  }

  if (!farm) {
    return <div className="error">Farm not found</div>;
  }

  return (
    <div className="farm-detail">
      <div className="farm-header">
        <Link to="/farms" className="back-button">← Back to Farms</Link>
        <h1>{farm.name}</h1>
        <button onClick={handleCalculateCredits} className="calculate-btn">
          Calculate Carbon Credits
        </button>
      </div>

      <div className="farm-info">
        <div className="info-card">
          <h3>Farm Details</h3>
          <p><strong>Area:</strong> {farm.area} hectares</p>
          <p><strong>Crop Type:</strong> {farm.cropType}</p>
          <p><strong>Practices:</strong> {farm.practices.join(', ') || 'None'}</p>
          <p><strong>Established:</strong> {new Date(farm.establishmentDate).toLocaleDateString()}</p>
        </div>

        <div className="info-card">
          <h3>Location</h3>
          <FarmMap farms={[farm]} />
        </div>
      </div>

      <div className="tabs">
        <button 
          className={activeTab === 'overview' ? 'active' : ''}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={activeTab === 'carbon' ? 'active' : ''}
          onClick={() => setActiveTab('carbon')}
        >
          Carbon Credits
        </button>
        <button 
          className={activeTab === 'satellite' ? 'active' : ''}
          onClick={() => setActiveTab('satellite')}
        >
          Satellite Data
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <h3>Recent Activity</h3>
            <p>Farm overview and recent activities will be displayed here.</p>
          </div>
        )}

        {activeTab === 'carbon' && carbonData && (
          <CarbonDashboard farmId={id} data={carbonData} />
        )}

        {activeTab === 'satellite' && satelliteData && (
          <div className="satellite-tab">
            <h3>Satellite Imagery</h3>
            {satelliteData.imagery && satelliteData.imagery.length > 0 ? (
              <div className="imagery-grid">
                {satelliteData.imagery.map((image, index) => (
                  <div key={index} className="image-card">
                    <p><strong>Date:</strong> {new Date(image.date).toLocaleDateString()}</p>
                    <p><strong>Source:</strong> {image.source}</p>
                    <p><strong>Cloud Cover:</strong> {(image.cloudCover * 100).toFixed(1)}%</p>
                    <p><strong>NDVI:</strong> {image.vegetationIndex?.toFixed(3)}</p>
                    {image.url && (
                      <a href={image.url} target="_blank" rel="noopener noreferrer">
                        View Image
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p>No satellite imagery available for this farm.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FarmDetail;