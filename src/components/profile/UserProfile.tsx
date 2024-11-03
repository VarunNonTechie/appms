import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import ProfileInfo from './ProfileInfo';
import ProfileSettings from './ProfileSettings';
import MeasurementPreferences from './MeasurementPreferences';

const UserProfile: React.FC = () => {
  const [activeTab, setActiveTab] = useState('info');
  const { user } = useAuth();

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Profile Settings</h1>
        <div className="profile-tabs">
          <button 
            className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`}
            onClick={() => setActiveTab('info')}
          >
            Personal Info
          </button>
          <button 
            className={`tab-btn ${activeTab === 'preferences' ? 'active' : ''}`}
            onClick={() => setActiveTab('preferences')}
          >
            Measurement Preferences
          </button>
          <button 
            className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            Account Settings
          </button>
        </div>
      </div>

      <div className="profile-content">
        {activeTab === 'info' && <ProfileInfo />}
        {activeTab === 'preferences' && <MeasurementPreferences />}
        {activeTab === 'settings' && <ProfileSettings />}
      </div>
    </div>
  );
};

export default UserProfile; 