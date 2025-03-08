import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { useAuthStore } from '../../store/authStore';

jest.mock('../../store/authStore', () => ({
  useAuthStore: jest.fn()
}));

const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>;

describe('Navbar Component', () => {
  const mockLogout = jest.fn();

  beforeEach(() => {
    mockUseAuthStore.mockImplementation(() => ({
      isAuthenticated: false,
      userRole: null,
      logout: mockLogout,
      login: jest.fn(),
      token: null,
      error: null,
      isLoading: false,
      connectionStatus: {
        isConnected: false,
        language: null
      },
      clearError: jest.fn()
    }));
  });

  test('renders login button when not authenticated', () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Login / Sign Up')).toBeInTheDocument();
  });

  test('renders user menu when authenticated', () => {
    mockUseAuthStore.mockImplementation(() => ({
      isAuthenticated: true,
      userRole: 'User',
      logout: mockLogout,
      login: jest.fn(),
      token: null,
      error: null,
      isLoading: false,
      connectionStatus: {
        isConnected: false,
        language: null
      },
      clearError: jest.fn()
    }));

    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  test('shows admin panel link for admin users', () => {
    mockUseAuthStore.mockImplementation(() => ({
      isAuthenticated: true,
      userRole: 'Admin',
      logout: mockLogout,
      login: jest.fn(),
      token: null,
      error: null,
      isLoading: false,
      connectionStatus: {
        isConnected: false,
        language: null
      },
      clearError: jest.fn()
    }));

    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Admin Panel')).toBeInTheDocument();
  });
}); 