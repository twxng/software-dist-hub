import { FC, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { contentService } from '../services/contentService';
import { MainCategory, SubCategory } from '../types/content';
import '../styles/components/Sidebar.css';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CategoryWithSubcategories extends MainCategory {
  subCategories: SubCategory[];
  isOpen: boolean;
}

const Sidebar: FC<SidebarProps> = ({ isOpen, onClose }) => {
  const [categories, setCategories] = useState<CategoryWithSubcategories[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoading(true);
        setError(null);

        
        const categoriesResponse = await contentService.getCategories();

        if (categoriesResponse.statusCode === 200 && categoriesResponse.data) {
          
          const mainCategories: Record<number, CategoryWithSubcategories> = {};
          
          categoriesResponse.data.forEach(subCategory => {
            const mainCategoryId = subCategory.mainCategory.id;
            
            if (!mainCategories[mainCategoryId]) {
              mainCategories[mainCategoryId] = {
                id: mainCategoryId,
                name: subCategory.mainCategory.name,
                subCategories: [],
                isOpen: false
              };
            }
            
            mainCategories[mainCategoryId].subCategories.push(subCategory);
          });
          
          setCategories(Object.values(mainCategories));
        } else {
          setError(categoriesResponse.message || 'Не вдалося завантажити категорії');
        }
      } catch (err) {
        console.error('Помилка завантаження категорій:', err);
        setError(err instanceof Error ? err.message : 'Виникла помилка');
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  const toggleCategory = (categoryId: number) => {
    setCategories(prevCategories => 
      prevCategories.map(category => 
        category.id === categoryId 
          ? { ...category, isOpen: !category.isOpen } 
          : category
      )
    );
  };

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose}></div>}
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>Catalog</h2>
          <button className="close-button" onClick={onClose} aria-label="Close menu">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="sidebar-content">
          {isLoading ? (
            <div className="sidebar-loading">Loading categories...</div>
          ) : error ? (
            <div className="sidebar-error">{error}</div>
          ) : (
            <div className="category-list">
              <Link to="/" className="sidebar-link main-link" onClick={onClose}>
                Home
              </Link>
              <Link to="/popular" className="sidebar-link main-link" onClick={onClose}>
                Popular Programs
              </Link>
              <div className="categories-divider">Categories</div>
              {categories.map(category => (
                <div key={category.id} className="category-item">
                  <div 
                    className="category-header" 
                    onClick={() => toggleCategory(category.id)}
                  >
                    <span>{category.name}</span>
                    <span className={`category-toggle ${category.isOpen ? 'open' : ''}`}>
                      {category.isOpen ? '▼' : '►'}
                    </span>
                  </div>
                  {category.isOpen && (
                    <div className="subcategory-list">
                      {category.subCategories.map(subCategory => (
                        <Link 
                          to={`/category/${subCategory.id}`} 
                          key={subCategory.id}
                          className="subcategory-item"
                          onClick={onClose}
                        >
                          {subCategory.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;