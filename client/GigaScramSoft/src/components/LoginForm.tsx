import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';

interface LoginFormProps {
  onSuccess: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    login: '',
    password: '',
    rememberMe: false
  });

  const [formErrors, setFormErrors] = useState({
    login: '',
    password: ''
  });

  const { login, error, isLoading } = useAuthStore();

  const validateForm = (): boolean => {
    const errors = {
      login: '',
      password: ''
    };

    if (!formData.login) {
      errors.login = 'Login is required';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    }

    setFormErrors(errors);
    return !Object.values(errors).some(error => error !== '');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await login(formData.login, formData.password);
      if (formData.rememberMe) {
        localStorage.setItem('rememberedLogin', formData.login);
      }
      onSuccess();
    } catch (error) {
      // Silent error handling - errors are managed by the store
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

      <div className="form-options">
        <div className="remember-me">
          <input
            type="checkbox"
            id="rememberMe"
            name="rememberMe"
            checked={formData.rememberMe}
            onChange={handleChange}
          />
          <label htmlFor="rememberMe">Remember me</label>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <button type="submit" className="auth-button" disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
};

export default LoginForm; 