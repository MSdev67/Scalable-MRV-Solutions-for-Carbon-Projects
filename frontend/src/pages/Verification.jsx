import { useState, useEffect } from 'react';
import { carbonAPI } from '../services/api';
import './Verification.css';

const Verification = () => {
  const [pendingVerifications, setPendingVerifications] = useState([]);
  const [completedVerifications, setCompletedVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    fetchVerifications();
  }, []);

  const fetchVerifications = async () => {
    try {
      const response = await carbonAPI.getPending();
      setPendingVerifications(response.data.data.verifications || []);
      
      // For now, we'll simulate completed verifications
      // In a real app, you'd fetch these from the API
      setCompletedVerifications([
        {
          farmId: '1',
          farmName: 'Green Valley Farm',
          period: '2023-Q3',
          calculatedCredits: 15.2,
          verifiedCredits: 14.8,
          status: 'approved',
          verificationDate: '2023-10-15'
        }
      ]);
    } catch (error) {
      console.error('Error fetching verifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (verification) => {
    try {
      // In a real app, you'd call the API to approve
      alert(`Approved verification for ${verification.farmName} - ${verification.period}`);
      
      // Remove from pending and add to completed
      setPendingVerifications(prev => 
        prev.filter(v => v.farmId !== verification.farmId || v.period !== verification.period)
      );
      
      setCompletedVerifications(prev => [
        ...prev,
        {
          ...verification,
          status: 'approved',
          verifiedCredits: verification.calculatedCredits,
          verificationDate: new Date().toISOString()
        }
      ]);
    } catch (error) {
      alert('Error approving verification: ' + error.message);
    }
  };

  const handleReject = async (verification) => {
    try {
      const reason = prompt('Please enter reason for rejection:');
      if (reason) {
        alert(`Rejected verification for ${verification.farmName}. Reason: ${reason}`);
        
        setPendingVerifications(prev => 
          prev.filter(v => v.farmId !== verification.farmId || v.period !== verification.period)
        );
        
        setCompletedVerifications(prev => [
          ...prev,
          {
            ...verification,
            status: 'rejected',
            verifiedCredits: 0,
            verificationDate: new Date().toISOString(),
            rejectionReason: reason
          }
        ]);
      }
    } catch (error) {
      alert('Error rejecting verification: ' + error.message);
    }
  };

  if (loading) {
    return <div className="loading">Loading verifications...</div>;
  }

  return (
    <div className="verification-page">
      <div className="page-header">
        <h1>Carbon Credit Verification</h1>
        <div className="tabs">
          <button 
            className={activeTab === 'pending' ? 'active' : ''}
            onClick={() => setActiveTab('pending')}
          >
            Pending ({pendingVerifications.length})
          </button>
          <button 
            className={activeTab === 'completed' ? 'active' : ''}
            onClick={() => setActiveTab('completed')}
          >
            Completed ({completedVerifications.length})
          </button>
        </div>
      </div>

      {activeTab === 'pending' && (
        <div className="verification-list">
          {pendingVerifications.length === 0 ? (
            <div className="empty-state">
              <p>No pending verifications</p>
            </div>
          ) : (
            pendingVerifications.map((verification, index) => (
              <div key={index} className="verification-card pending">
                <div className="verification-info">
                  <h3>{verification.farmName}</h3>
                  <p><strong>Farmer:</strong> {verification.farmerName}</p>
                  <p><strong>Period:</strong> {verification.period}</p>
                  <p><strong>Crop Type:</strong> {verification.cropType}</p>
                  <p><strong>Calculated Credits:</strong> {verification.calculatedCredits.toFixed(2)}</p>
                </div>
                <div className="verification-actions">
                  <button 
                    onClick={() => handleApprove(verification)}
                    className="approve-btn"
                  >
                    Approve
                  </button>
                  <button 
                    onClick={() => handleReject(verification)}
                    className="reject-btn"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'completed' && (
        <div className="verification-list">
          {completedVerifications.length === 0 ? (
            <div className="empty-state">
              <p>No completed verifications</p>
            </div>
          ) : (
            completedVerifications.map((verification, index) => (
              <div key={index} className={`verification-card ${verification.status}`}>
                <div className="verification-info">
                  <h3>{verification.farmName}</h3>
                  <p><strong>Period:</strong> {verification.period}</p>
                  <p><strong>Status:</strong> 
                    <span className={`status-badge ${verification.status}`}>
                      {verification.status}
                    </span>
                  </p>
                  <p><strong>Calculated:</strong> {verification.calculatedCredits.toFixed(2)} credits</p>
                  <p><strong>Verified:</strong> {verification.verifiedCredits.toFixed(2)} credits</p>
                  {verification.verificationDate && (
                    <p><strong>Date:</strong> {new Date(verification.verificationDate).toLocaleDateString()}</p>
                  )}
                  {verification.rejectionReason && (
                    <p><strong>Reason:</strong> {verification.rejectionReason}</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Verification;