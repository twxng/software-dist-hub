import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
// import { decodeJWT } from '../utils/jwt';
import AuthModal from './AuthModal';
import "../styles/components/Navbar.css"
import Sidebar from './Sidebar';
import { contentService } from '../services/contentService';

const Navbar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated, logout, userRole, user } = useAuthStore();
  const navigate = useNavigate();
  // const token = localStorage.getItem('token');
  // const decodedToken = token ? decodeJWT(token) : null;

  useEffect(() => {
    console.log('Navbar rendering with auth state:', { 
      isAuthenticated, 
      userRole,
      hasToken: !!localStorage.getItem('token'),
      user
    });
  }, [isAuthenticated, userRole, user]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  const handleLogout = () => {
    console.log('Logging out, current state:', { isAuthenticated, userRole });
    logout();
    console.log('After logout, localStorage token:', localStorage.getItem('token'));
    setShowUserMenu(false);
    navigate('/');
  };

  // Закриваємо випадаюче меню при кліку поза ним
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Отримуємо підказки при введенні
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length >= 1) {
        setIsLoading(true);
        try {
          console.log(`[Navbar] Getting suggestions for: "${searchQuery}"`);
          const response = await contentService.getSuggestions(searchQuery);
          if (response.statusCode === 200 && response.data) {
            console.log(`[Navbar] Got ${response.data.length} suggestions`);
            setSuggestions(response.data);
            setShowSuggestions(true);
          } else {
            console.warn(`[Navbar] Failed to get suggestions: ${response.message}`);
            setSuggestions([]);
            setShowSuggestions(false);
          }
        } catch (error) {
          console.error('[Navbar] Error fetching suggestions:', error);
          setSuggestions([]);
          setShowSuggestions(false);
        } finally {
          setIsLoading(false);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300); // Затримка в 300мс

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Закриваємо підказки при кліку поза пошуковим полем
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}&page=1`);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    // Перевіряємо, чи це категорія (містить "/")
    if (suggestion.includes('/')) {
      // Це категорія, розбираємо на основну категорію та підкатегорію
      const parts = suggestion.split('/').map(part => part.trim());
      
      // Шукаємо категорію та підкатегорію
      const findCategoryId = async () => {
        try {
          const response = await contentService.getCategories();
          if (response.statusCode === 200 && response.data) {
            // Шукаємо відповідну категорію
            const category = response.data.find(cat => 
              cat.mainCategory && 
              cat.mainCategory.name === parts[0] && 
              cat.name === parts[1]
            );
            
            if (category) {
              // Перенаправляємо на пошук за категорією
              navigate(`/search?category=${category.id}&page=1`);
              setSearchQuery(''); // Очищаємо пошуковий запит при виборі категорії
            } else {
              // Якщо категорія не знайдена, шукаємо за текстом
              navigate(`/search?q=${encodeURIComponent(suggestion)}&page=1`);
              setSearchQuery(suggestion);
            }
          }
        } catch (error) {
          console.error('Error finding category:', error);
          // Шукаємо за текстом при помилці
          navigate(`/search?q=${encodeURIComponent(suggestion)}&page=1`);
          setSearchQuery(suggestion);
        }
      };
      
      findCategoryId();
    } else {
      // Звичайний пошук за текстом
      navigate(`/search?q=${encodeURIComponent(suggestion)}&page=1`);
      setSearchQuery(suggestion);
    }
    
    setShowSuggestions(false);
  };

  // Виділяємо початок слова, який співпадає з пошуком
  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    // Перевіряємо, чи текст містить категорію (містить "/")
    if (text.includes('/')) {
      const parts = text.split('/').map(part => part.trim());
      
      // Пошук по головній категорії
      if (parts[0].toLowerCase().includes(query.toLowerCase())) {
        const index = parts[0].toLowerCase().indexOf(query.toLowerCase());
        const beforeMatch = parts[0].substring(0, index);
        const match = parts[0].substring(index, index + query.length);
        const afterMatch = parts[0].substring(index + query.length);
        
        return (
          <span className="category">
            <span className="category-parent">
              {beforeMatch}<strong>{match}</strong>{afterMatch}
            </span>
            <span className="category-separator">/</span>
            <span>{parts[1]}</span>
          </span>
        );
      }
      
      // Пошук по підкатегорії
      if (parts[1].toLowerCase().includes(query.toLowerCase())) {
        const index = parts[1].toLowerCase().indexOf(query.toLowerCase());
        const beforeMatch = parts[1].substring(0, index);
        const match = parts[1].substring(index, index + query.length);
        const afterMatch = parts[1].substring(index + query.length);
        
        return (
          <span className="category">
            <span className="category-parent">{parts[0]}</span>
            <span className="category-separator">/</span>
            <span>
              {beforeMatch}<strong>{match}</strong>{afterMatch}
            </span>
          </span>
        );
      }
      
      // Якщо пошуковий запит не знайдений, просто форматуємо категорію
      return (
        <span className="category">
          <span className="category-parent">{parts[0]}</span>
          <span className="category-separator">/</span>
          <span>{parts[1]}</span>
        </span>
      );
    }
    
    // Звичайний текст, не категорія
    const index = text.toLowerCase().indexOf(query.toLowerCase());
    
    // Якщо текст починається з запиту - виділяємо початок
    if (index === 0) {
      const highlighted = (
        <>
          <strong>{text.substring(0, query.length)}</strong>
          {text.substring(query.length)}
        </>
      );
      return highlighted;
    } 
    // Інакше виділяємо всі входження
    else if (index > 0) {
      const beforeMatch = text.substring(0, index);
      const match = text.substring(index, index + query.length);
      const afterMatch = text.substring(index + query.length);
      
      const highlighted = (
        <>
          {beforeMatch}<strong>{match}</strong>{afterMatch}
        </>
      );
      return highlighted;
    }
    
    return text;
  };

  // Генеруємо аватар для користувача
  const renderUserAvatar = () => {
    // Визначаємо, чи є користувач адміністратором
    const isAdmin = userRole === 'Admin';
    
    // Якщо є збережений аватар, використовуємо його
    if (user?.avatar) {
      return (
        <div className={`user-avatar ${isAdmin ? 'admin' : ''}`}>
          <img src={user.avatar} alt={`${user.login}'s avatar`} />
        </div>
      );
    }
    
    // Інакше генеруємо кольоровий аватар на основі ролі та першої літери логіну
    const bgColor = isAdmin ? '#E74C3C' : '#3498DB';
    const letter = user?.login ? user.login.charAt(0).toUpperCase() : '?';
    
    return (
      <div className={`user-avatar ${isAdmin ? 'admin' : ''}`} style={{ backgroundColor: bgColor }}>
        {letter}
      </div>
    );
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-left">
          <button className="menu-button" onClick={toggleSidebar} aria-label="Open menu">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Link to="/" className="navbar-brand">
            SoftwareHub
          </Link>
        </div>

        <div className="search-container" ref={searchRef}>
          <form onSubmit={handleSearch} className="search-form">
            <div className={`search-wrapper ${isFocused ? 'focused' : ''}`}>
              <input
                type="text"
                className="search-input"
                placeholder="Search software..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  setIsFocused(true);
                  if (searchQuery.trim().length >= 1) {
                    setShowSuggestions(true);
                  }
                }}
                onBlur={() => setIsFocused(false)}
              />
              {isLoading ? (
                <div className="search-loader"></div>
              ) : (
                <button type="submit" className="search-button" aria-label="Search">
                  <svg className="search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              )}
              
              {showSuggestions && suggestions.length > 0 && (
                <div className="search-suggestions">
                  {suggestions.map((suggestion, index) => (
                    <div 
                      key={index} 
                      className="search-suggestion-item"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      <svg className="suggestion-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {highlightMatch(suggestion, searchQuery)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </form>
        </div>

        <div className="navbar-right">
          <Link to="/" className="navbar-link">
            Home
          </Link>
          {isAuthenticated ? (
            <div className="user-menu-container" ref={userMenuRef}>
              <div 
                className="user-avatar-wrapper" 
                onClick={toggleUserMenu}
                role="button"
                aria-label="Open user menu"
              >
                {renderUserAvatar()}
              </div>
              
              {showUserMenu && (
                <div className="user-dropdown-menu">
                  <div className="user-dropdown-header">
                    <div className="user-dropdown-name">{user?.login || 'User'}</div>
                    <div className="user-dropdown-role">{userRole}</div>
                  </div>
                  
                  {userRole === 'Admin' && (
                    <Link 
                      to="/admin" 
                      className="user-dropdown-item" 
                      onClick={() => setShowUserMenu(false)}
                    >
                      <svg className="user-dropdown-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Admin Panel
                    </Link>
                  )}
                  
                  <Link 
                    to="/profile" 
                    className="user-dropdown-item"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <svg className="user-dropdown-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Profile
                  </Link>
                  
                  <button 
                    onClick={handleLogout} 
                    className="user-dropdown-item user-dropdown-logout"
                  >
                    <svg className="user-dropdown-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button 
              onClick={() => setIsAuthModalOpen(true)} 
              className="navbar-button"
            >
              Login / Register
            </button>
          )}
        </div>
				
      </div>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </nav>
  );
};

export default Navbar;