import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AuthModal from '../../components/AuthModal';

describe('AuthModal Component', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders login form by default', () => {
    render(<AuthModal isOpen={true} onClose={mockOnClose} />);
    
    // Перевіряємо заголовки вкладок
    expect(screen.getByRole('tab', { name: 'Login' })).toHaveClass('active');
    expect(screen.getByRole('tab', { name: 'Sign Up' })).not.toHaveClass('active');
    
    // Перевіряємо поля форми
    expect(screen.getByLabelText('Login')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Remember me' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
  });

  test('switches to signup form when signup tab is clicked', async () => {
    render(<AuthModal isOpen={true} onClose={mockOnClose} />);
    
    const signUpTab = screen.getByRole('tab', { name: 'Sign Up' });
    fireEvent.click(signUpTab);
    
    await waitFor(() => {
      expect(signUpTab).toHaveClass('active');
      expect(screen.getByRole('tab', { name: 'Login' })).not.toHaveClass('active');
    });
  });

  test('closes modal when clicking close button', () => {
    render(<AuthModal isOpen={true} onClose={mockOnClose} />);
    
    const closeButton = screen.getByRole('button', { name: 'Close' });
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalled();
  });
}); 