import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { apiService } from '../services/api';

interface SignUpFormProps {
  onSuccess: () => void;
  onSwitchToLogin: () => void;
}

const SignUpForm: React.FC<SignUpFormProps> = ({ onSuccess, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    login: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [formErrors, setFormErrors] = useState({
    login: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login: loginAction } = useAuthStore();

  const validateForm = (): boolean => {
    const errors = {
      login: '',
      email: '',
      password: '',
      confirmPassword: ''
    };

    if (!formData.login) {
      errors.login = 'Login is required';
    }

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setFormErrors(errors);
    return !Object.values(errors).some(error => error !== '');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiService.signUp({
        login: formData.login,
        email: formData.email,
        password: formData.password
      });

      if (response.statusCode === 200) {
        try {
          await loginAction(formData.login, formData.password);
          onSuccess();
        } catch (loginError) {
          onSwitchToLogin();
        }
      } else {
        setError(response.message || 'Registration failed');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <div className="form-group">
        <label htmlFor="login">Login</label>
        <input
          type="text"
          id="login"
          name="login"
          value={formData.login}
          onChange={handleChange}
          className={formErrors.login ? 'error' : ''}
        />
        {formErrors.login && <span className="error-message">{formErrors.login}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={formErrors.email ? 'error' : ''}
        />
        {formErrors.email && <span className="error-message">{formErrors.email}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          className={formErrors.password ? 'error' : ''}
        />
        {formErrors.password && <span className="error-message">{formErrors.password}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="confirmPassword">Confirm Password</label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          className={formErrors.confirmPassword ? 'error' : ''}
        />
        {formErrors.confirmPassword && <span className="error-message">{formErrors.confirmPassword}</span>}
      </div>

      {error && <div className="error-message">{error}</div>}
      
      <button type="submit" className="auth-button" disabled={isLoading}>
        {isLoading ? 'Creating account...' : 'Sign Up'}
      </button>
    </form>
  );
};

export default SignUpForm; 