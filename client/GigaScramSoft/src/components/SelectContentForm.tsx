import React, { useState, useEffect } from 'react';
import { ContentUnit } from '../types/content';
import { contentService } from '../services/contentService';
import { useAuthStore } from '../store/authStore';
import '../styles/components/SelectContentForm.css';

interface SelectContentFormProps {
  onSelect: (contentId: number) => void;
  onClose: () => void;
}

const SelectContentForm: React.FC<SelectContentFormProps> = ({ onSelect, onClose }) => {
  const [contentItems, setContentItems] = useState<ContentUnit[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, userRole } = useAuthStore();

  useEffect(() => {
    // Check authorization
    if (!isAuthenticated) {
      setError('You need to be logged in');
    } else if (userRole !== 'Admin') {
      setError('Insufficient permissions to access this page');
    } else {
      // If authorization is successful, load content
      loadContent();
    }
  }, [isAuthenticated, userRole]);

  const loadContent = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Use a more efficient approach - get all content at once if possible
      try {
        // First try to get all content with a single request if your API supports it
        const response = await contentService.getAllContent();
        if (response.statusCode === 200 && response.data) {
          setContentItems(response.data);
          return;
        }
      } catch (error) {
        console.log('Bulk content loading not available, falling back to individual requests');
      }
      
      // Fallback: Load content in parallel with Promise.all
      const idsToTry = Array.from({ length: 20 }, (_, i) => i + 1);
      
      const contentPromises = idsToTry.map(id => 
        contentService.getContentById(id)
          .then(response => {
            if (response.statusCode === 200 && response.data) {
              return response.data;
            }
            return null;
          })
          .catch(() => null)
      );
      
      const results = await Promise.all(contentPromises);
      const validContent = results.filter(item => item !== null) as ContentUnit[];
      
      setContentItems(validContent);
    } catch (err) {
      setError('Failed to load content. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedId) {
      onSelect(selectedId);
    }
  };

  return (
    <div className="select-content-overlay">
      <div className="select-content-form">
        <h2>Select Content to Edit</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        {isLoading ? (
          <div className="loading-indicator">Loading content...</div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="contentSelect">Choose content item:</label>
              <select 
                id="contentSelect"
                value={selectedId || ''}
                onChange={(e) => setSelectedId(Number(e.target.value))}
                required
              >
                <option value="">-- Select content --</option>
                {contentItems.map(item => (
                  <option key={item.id} value={item.id}>
                    ID: {item.id} - {item.header}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-actions">
              <button 
                type="submit" 
                className="btn-submit" 
                disabled={!selectedId}
              >
                Edit Selected Content
              </button>
              <button 
                type="button" 
                className="btn-cancel" 
                onClick={onClose}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SelectContentForm; 