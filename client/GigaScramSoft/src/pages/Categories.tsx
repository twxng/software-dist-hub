import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { contentService } from '../services/contentService';
import { ContentUnitSubCategoryModel } from '../types/content';
import '../styles/components/Home.css';
import '../styles/pages/Categories.css';

const categoryImages: Record<number, string> = {
  1: 'https://img.icons8.com/fluency/96/000000/puzzle.png', 
  2: 'https://img.icons8.com/fluency/96/000000/programming.png', 
  3: 'https://img.icons8.com/fluency/96/000000/video-editing.png', 
  4: 'https://img.icons8.com/fluency/96/000000/data-protection.png',
  5: 'https://img.icons8.com/fluency/96/000000/tools.png', 
  6: 'https://img.icons8.com/fluency/96/000000/ms-office.png',
  7: 'https://img.icons8.com/fluency/96/000000/education.png', 
  8: 'https://img.icons8.com/fluency/96/000000/communicate.png', 
};

const getCategoryImage = (categoryId: number): string => {
  return categoryImages[categoryId] || 'https://img.icons8.com/fluency/96/000000/software.png';
};
const Categories: React.FC = () => {
  const [categories, setCategories] = useState<ContentUnitSubCategoryModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadedCategories, setLoadedCategories] = useState<number[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const categoriesResponse = await contentService.getCategories();
        
        if (categoriesResponse.statusCode === 200 && categoriesResponse.data) {
          setCategories(categoriesResponse.data);
          
          
          setTimeout(() => {
            setLoadedCategories(categoriesResponse.data.map(cat => cat.id));
          }, 100);
        } else {
          setError(categoriesResponse.message || "Failed to load categories");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    loadCategories();
  }, []);

  const handleCategoryClick = (categoryId: number) => {
    navigate(`/category/${categoryId}`);
  };

  
  const groupedCategories: Record<string, ContentUnitSubCategoryModel[]> = {};
  
  categories.forEach(category => {
    const mainCategoryName = category.mainCategory.name;
    if (!groupedCategories[mainCategoryName]) {
      groupedCategories[mainCategoryName] = [];
    }
    groupedCategories[mainCategoryName].push(category);
  });

  return (
    <div className="categories-container">
      <div className="categories-hero">
        <h1 className="categories-title">Software Categories</h1>
        <p className="categories-description">
          Find the software you need by category
        </p>
      </div>

      {isLoading ? (
        <div className="categories-loading">
          <div className="loading-spinner"></div>
          <p>Loading categories...</p>
        </div>
      ) : error ? (
        <div className="categories-error">
          <p>{error}</p>
        </div>
      ) : (
        <div className="categories-content">
          {Object.entries(groupedCategories).map(([mainCategoryName, subCategories]) => (
            <div key={mainCategoryName} className="main-category-section">
              <h2 className="main-category-title">{mainCategoryName}</h2>
              <div className="category-cards-container">
                {subCategories.map((category) => (
                  <div
                    key={category.id}
                    className={`category-card ${
                      loadedCategories.includes(category.id) ? "category-card-appear" : ""
                    }`}
                    onClick={() => handleCategoryClick(category.id)}
                  >
                    <div className="category-card-image">
                      <img
                        src={getCategoryImage(category.mainCategoryId)}
                        alt={category.name}
                        onLoad={() => {
                          if (!loadedCategories.includes(category.id)) {
                            setLoadedCategories((prev) => [...prev, category.id]);
                          }
                        }}
                      />
                    </div>
                    <div className="category-card-info">
                      <h3 className="category-card-title">{category.name}</h3>
                      <p className="category-card-parent">{category.mainCategory.name}</p>
                      <div className="category-card-action">
                        <button className="view-category-button">View ➔</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Categories; 