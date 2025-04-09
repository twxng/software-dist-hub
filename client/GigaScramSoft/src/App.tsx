import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Popular from './pages/Popular';
import Search from './pages/Search';
import Category from './pages/Category';
import Categories from './pages/Categories';
// import { Login } from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import UserProfile from './pages/UserProfile';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuthStore } from './store/authStore';
import { decodeJWT } from './utils/jwt';
// import { SignUp } from './pages/SignUp';
// import ContentManagement from './pages/ContentManagement';
import ContentDetails from './pages/ContentDetails';

const App = () => {
  const { token, userRole, checkAuthStatus } = useAuthStore();

  useEffect(() => {
    console.log('App initialized with token:', token ? 'exists' : 'none');
    console.log('Current userRole:', userRole);
    
    // Перевіряємо статус авторизації при завантаженні додатку
    checkAuthStatus();
    
    if (token && !userRole) {
      const decodedToken = decodeJWT(token);
      console.log('Decoded token:', decodedToken);
      
      if (decodedToken?.Role) {
        console.log('Setting userRole from token:', decodedToken.Role);
        useAuthStore.setState({ userRole: decodedToken.Role });
      }
    }
  }, [token, userRole, checkAuthStatus]);

  console.log('Rendering App with userRole:', userRole);

  useEffect(() => {
    if (window.location.pathname.includes('/admin')) {
      console.log('Admin route detected in URL, current userRole:', userRole);
    }
  }, [userRole, window.location.pathname]);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/popular" element={<Popular />} />
            <Route path="/search" element={<Search />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/category/:categoryId" element={<Category />} />
            {/* <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} /> */}
            <Route path="/content/:id" element={<ContentDetails />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute allowedRoles={['Admin', 'User']}>
                  <UserProfile />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/admin/content" 
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <AdminDashboard />
                  {/* <ContentManagement /> */}
                </ProtectedRoute>
              } 
            />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
