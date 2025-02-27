import { useAuthStore } from '../store/authStore';
import '../styles/components/UserProfile.css';

const UserProfile = () => {
  const { userRole } = useAuthStore();

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>User Profile</h1>
      </div>
      
      <div className="profile-content">
        <div className="profile-card">
          <div className="profile-section">
            <h3>Account Information</h3>
            <div className="info-group">
              <label>Role:</label>
              <span>{userRole}</span>
            </div>
            <div className="info-group">
              <label>Account Status:</label>
              <span className="status-active">Active</span>
            </div>
          </div>

          {/* <div className="profile-section">
            <h3>Security</h3>
            <button className="profile-button">Change Password</button>
          </div>

          <div className="profile-section">
            <h3>Preferences</h3>
            <div className="preferences-group">
              <label>
                <input type="checkbox" /> Email Notifications
              </label>
              <label>
                <input type="checkbox" /> Update Alerts
              </label>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default UserProfile; 