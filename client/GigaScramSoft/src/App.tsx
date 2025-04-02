import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
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
  const { token, userRole } = useAuthStore();

  useEffect(() => {
    if (token && !userRole) {
      const decodedToken = decodeJWT(token);
      if (decodedToken?.Role) {
        useAuthStore.setState({ userRole: decodedToken.Role });
      }
    }
  }, [token, userRole]);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
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
