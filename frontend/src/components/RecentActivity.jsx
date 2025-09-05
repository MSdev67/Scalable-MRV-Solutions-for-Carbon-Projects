import './RecentActivity.css';

const RecentActivity = () => {
  const activities = [
    {
      id: 1,
      type: 'carbon_calculation',
      farm: 'Green Valley Farm',
      period: '2023-Q4',
      credits: 18.7,
      timestamp: '2023-12-15T10:30:00Z',
      status: 'completed'
    },
    {
      id: 2,
      type: 'data_collection',
      farm: 'Sunrise Agro',
      period: '2023-Q4',
      credits: null,
      timestamp: '2023-12-14T14:20:00Z',
      status: 'completed'
    },
    {
      id: 3,
      type: 'verification',
      farm: 'Organic Fields',
      period: '2023-Q3',
      credits: 15.2,
      timestamp: '2023-12-13T09:15:00Z',
      status: 'approved'
    }
  ];

  const getActivityIcon = (type) => {
    switch (type) {
      case 'carbon_calculation': return '📊';
      case 'data_collection': return '📝';
      case 'verification': return '✅';
      default: return '🔔';
    }
  };

  const getActivityText = (activity) => {
    switch (activity.type) {
      case 'carbon_calculation':
        return `Carbon calculation completed for ${activity.farm} (${activity.period}): ${activity.credits} credits`;
      case 'data_collection':
        return `Ground truth data collected for ${activity.farm}`;
      case 'verification':
        return `Carbon credits verified for ${activity.farm}: ${activity.credits} credits approved`;
      default:
        return `Activity: ${activity.type}`;
    }
  };

  return (
    <div className="recent-activity">
      <h3>Recent Activity</h3>
      <div className="activity-list">
        {activities.map(activity => (
          <div key={activity.id} className="activity-item">
            <div className="activity-icon">
              {getActivityIcon(activity.type)}
            </div>
            <div className="activity-content">
              <p>{getActivityText(activity)}</p>
              <span className="activity-time">
                {new Date(activity.timestamp).toLocaleDateString()} at{' '}
                {new Date(activity.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;