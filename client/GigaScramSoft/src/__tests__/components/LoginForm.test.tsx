import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginForm from '../../components/LoginForm';
import { useAuthStore } from '../../store/authStore';

// Мокаємо useAuthStore
jest.mock('../../store/authStore', () => ({
  useAuthStore: jest.fn()
}));

const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>;

describe('LoginForm Component', () => {
  const mockOnSuccess = jest.fn();
  const mockLogin = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuthStore.mockImplementation(() => ({
      login: mockLogin,
      error: null,
      isLoading: false,
      token: null,
      userRole: null,
      isAuthenticated: false,
      connectionStatus: {
        isConnected: false,
        language: null
      },
      logout: jest.fn(),
      clearError: jest.fn()
    }));
  });

  test('renders all form elements', () => {
    render(<LoginForm onSuccess={mockOnSuccess} />);
    
    expect(screen.getByLabelText('Login')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Remember me' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
  });

  test('validates required fields', async () => {
    render(<LoginForm onSuccess={mockOnSuccess} />);
    
    fireEvent.click(screen.getByRole('button', { name: 'Login' }));

    expect(screen.getByText('Login is required')).toBeInTheDocument();
    expect(screen.getByText('Password is required')).toBeInTheDocument();
  });

  test('submits form with valid data', async () => {
    render(<LoginForm onSuccess={mockOnSuccess} />);
    
    fireEvent.change(screen.getByLabelText('Login'), {
      target: { value: 'user1' }
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: '123123' }
    });
    
    const rememberMe = screen.getByRole('checkbox', { name: 'Remember me' });
    fireEvent.click(rememberMe);
    
    fireEvent.click(screen.getByRole('button', { name: 'Login' }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('user1', '123123', true);
    });
  });

  test('shows loading state during submission', () => {
    mockUseAuthStore.mockImplementation(() => ({
      ...mockUseAuthStore(),
      isLoading: true
    }));

    render(<LoginForm onSuccess={mockOnSuccess} />);
    
    expect(screen.getByRole('button', { name: 'Logging in...' })).toBeDisabled();
  });
}); 