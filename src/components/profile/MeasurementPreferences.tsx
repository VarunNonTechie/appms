import React, { useState } from 'react';

const MeasurementPreferences: React.FC = () => {
  const [preferences, setPreferences] = useState({
    unit: 'cm',
    notifications: true,
    reminderFrequency: 'weekly',
    privacyLevel: 'private'
  });

  const handleSave = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(preferences)
      });

      if (response.ok) {
        // Show success message
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  };

  return (
    <div className="measurement-preferences">
      <div className="preference-group">
        <label>Measurement Unit</label>
        <select
          value={preferences.unit}
          onChange={(e) => setPreferences({...preferences, unit: e.target.value})}
        >
          <option value="cm">Centimeters (cm)</option>
          <option value="in">Inches (in)</option>
        </select>
      </div>

      <div className="preference-group">
        <label>
          <input
            type="checkbox"
            checked={preferences.notifications}
            onChange={(e) => setPreferences({...preferences, notifications: e.target.checked})}
          />
          Enable Measurement Reminders
        </label>
      </div>

      {preferences.notifications && (
        <div className="preference-group">
          <label>Reminder Frequency</label>
          <select
            value={preferences.reminderFrequency}
            onChange={(e) => setPreferences({...preferences, reminderFrequency: e.target.value})}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
      )}

      <div className="preference-group">
        <label>Privacy Level</label>
        <select
          value={preferences.privacyLevel}
          onChange={(e) => setPreferences({...preferences, privacyLevel: e.target.value})}
        >
          <option value="private">Private</option>
          <option value="friends">Friends Only</option>
          <option value="public">Public</option>
        </select>
      </div>

      <button onClick={handleSave} className="save-btn">
        Save Preferences
      </button>
    </div>
  );
};

export default MeasurementPreferences; 