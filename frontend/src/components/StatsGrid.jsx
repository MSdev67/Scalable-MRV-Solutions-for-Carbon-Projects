import './StatsGrid.css';

const StatsGrid = ({ stats }) => {
  const defaultStats = {
    totalFarms: 0,
    totalArea: 0,
    totalCredits: 0,
    pendingVerifications: 0
  };

  const displayStats = { ...defaultStats, ...stats };

  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-icon">🏠</div>
        <div className="stat-content">
          <h3>Total Farms</h3>
          <p className="stat-value">{displayStats.totalFarms}</p>
        </div>
      </div>
      
      <div className="stat-card">
        <div className="stat-icon">🌾</div>
        <div className="stat-content">
          <h3>Total Area</h3>
          <p className="stat-value">{displayStats.totalArea} ha</p>
        </div>
      </div>
      
      <div className="stat-card">
        <div className="stat-icon">🌍</div>
        <div className="stat-content">
          <h3>Carbon Credits</h3>
          <p className="stat-value">{displayStats.totalCredits.toFixed(2)}</p>
        </div>
      </div>
      
      <div className="stat-card">
        <div className="stat-icon">✅</div>
        <div className="stat-content">
          <h3>Pending Verification</h3>
          <p className="stat-value">{displayStats.pendingVerifications}</p>
        </div>
      </div>
    </div>
  );
};

export default StatsGrid;