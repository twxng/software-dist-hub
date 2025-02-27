import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
// import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import UserProfile from './pages/UserProfile';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuthStore } from './store/authStore';
import { decodeJWT } from './utils/jwt';
// import SignUp from './pages/SignUp';

const App = () => {
  const { token, userRole } = useAuthStore();

  useEffect(() => {
    // Якщо є токен, але немає ролі - отримуємо роль з токену
    if (token && !userRole) {
      const decodedToken = decodeJWT(token);
      if (decodedToken?.role) {
        useAuthStore.setState({ userRole: decodedToken.role });
      }
    }
  }, [token, userRole]);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          {/* <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} /> */}
          <Route
            path="/admin/*"
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
        </Routes>
      </div>
    </Router>
  );
};

export default App;
