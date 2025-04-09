import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ContentItem } from '../types/content';
import { getUserDownloads } from '../services/userService';
import ReactStars from 'react-rating-stars-component';
import '../styles/pages/Profile.css';

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const [downloads, setDownloads] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDownloads = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const data = await getUserDownloads(user.id);
        setDownloads(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching user downloads:', err);
        setError('Failed to load download history. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDownloads();
  }, [user]);

  const handleLogout = () => {
    logout();
  };

  if (!user) {
    return (
      <div className="profile-container">
        <div className="profile-not-logged-in">
          <h2>Please login to view your profile</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>User Profile</h1>
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="profile-info">
        <div className="profile-avatar">
          {user.avatar ? (
            <img src={user.avatar} alt="User avatar" />
          ) : (
            <div className="default-avatar">
              {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
            </div>
          )}
        </div>
        <div className="profile-details">
          <h2>{user.username}</h2>
          <p className="profile-email">{user.email}</p>
          <p className="profile-role">Role: {user.role}</p>
          <p className="profile-joined">Member since: {new Date(user.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="profile-downloads">
        <h2>Download History</h2>
        
        {isLoading ? (
          <div className="loading-message">Loading download history...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : downloads.length === 0 ? (
          <div className="no-downloads-message">You haven't downloaded any software yet.</div>
        ) : (
          <div className="downloads-list">
            {downloads.map((item) => (
              <div key={item.id} className="download-item">
                <div className="download-item-header">
                  <h3>{item.title}</h3>
                  <span className="download-date">
                    Downloaded on: {new Date(item.downloadedAt || Date.now()).toLocaleDateString()}
                  </span>
                </div>
                <div className="download-item-info">
                  <div className="download-item-icon">
                    {item.icon ? (
                      <img src={item.icon} alt={`${item.title} icon`} />
                    ) : (
                      <div className="default-icon">{item.title.charAt(0)}</div>
                    )}
                  </div>
                  <div className="download-item-details">
                    <p className="download-item-description">{item.description}</p>
                    <div className="download-item-meta">
                      <span className="download-item-version">Version: {item.version}</span>
                      <div className="download-item-rating">
                        <ReactStars
                          count={5}
                          value={item.rating}
                          size={20}
                          edit={false}
                          activeColor="#ffd700"
                        />
                        <span className="rating-value">{item.rating.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile; 