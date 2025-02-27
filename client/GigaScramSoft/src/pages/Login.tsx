// import React, { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { useAuthStore } from '../store/authStore';
// import '../styles/Login.css';

// interface LoginFormData {
//   login: string;
//   password: string;
//   rememberMe: boolean;
// }

// const Login = () => {
//   const [formData, setFormData] = useState<LoginFormData>({
//     login: '',
//     password: '',
//     rememberMe: false
//   });

//   const [formErrors, setFormErrors] = useState({
//     login: '',
//     password: ''
//   });

//   const navigate = useNavigate();
//   const { login: loginAction, error, isLoading, clearError, isAuthenticated } = useAuthStore();

//   const validateForm = (): boolean => {
//     const errors = {
//       login: '',
//       password: ''
//     };

//     if (!formData.login) {
//       errors.login = 'Login is required';
//     }

//     if (!formData.password) {
//       errors.password = 'Password is required';
//     } else if (formData.password.length < 6) {
//       errors.password = 'Password must be at least 6 characters';
//     }

//     setFormErrors(errors);
//     return !errors.login && !errors.password;
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     if (!validateForm()) {
//       return;
//     }

//     try {
//       await loginAction(formData.login, formData.password);
//       if (formData.rememberMe) {
//         localStorage.setItem('rememberedLogin', formData.login);
//       }
      
//       const { userRole } = useAuthStore.getState();
      
//       // Перенаправляємо користувача відповідно до його ролі
//       if (userRole === 'Admin') {
//         navigate('/admin');
//       } else {
//         navigate('/');  // Звичайних користувачів перенаправляємо на головну
//       }
//     } catch (error) {
//       // Silent error handling - errors are managed by the store
//     }
//   };

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value, type, checked } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: type === 'checkbox' ? checked : value
//     }));
    
//     if (formErrors[name as keyof typeof formErrors]) {
//       setFormErrors(prev => ({
//         ...prev,
//         [name]: ''
//       }));
//     }
//   };

//   return (
//     <div className="login-container">
//       <div className="login-card">
//         <h1 className="login-title">Login</h1>
//         <form onSubmit={handleSubmit} className="login-form">
//           <div className="form-group">
//             <label htmlFor="login">Login</label>
//             <input
//               type="text"
//               id="login"
//               name="login"
//               value={formData.login}
//               onChange={handleChange}
//               className={formErrors.login ? 'error' : ''}
//             />
//             {formErrors.login && <span className="error-message">{formErrors.login}</span>}
//           </div>
//           <div className="form-group">
//             <label htmlFor="password">Password</label>
//             <input
//               type="password"
//               id="password"
//               name="password"
//               value={formData.password}
//               onChange={handleChange}
//               className={formErrors.password ? 'error' : ''}
//             />
//             {formErrors.password && <span className="error-message">{formErrors.password}</span>}
//           </div>
//           <div className="form-options">
//             <div className="remember-me">
//               <input
//                 type="checkbox"
//                 id="rememberMe"
//                 name="rememberMe"
//                 checked={formData.rememberMe}
//                 onChange={handleChange}
//               />
//               <label htmlFor="rememberMe">Remember me</label>
//             </div>
//             <Link to="/forgot-password" className="forgot-password">
//               Forgot password?
//             </Link>
//           </div>
//           {error && <div className="error-message">{error}</div>}
//           <button type="submit" className="login-button" disabled={isLoading}>
//             {isLoading ? 'Logging in...' : 'Login'}
//           </button>
//           <div className="signup-link">
//             Don't have an account?{' '}
//             <Link to="/signup">Sign up</Link>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default Login;