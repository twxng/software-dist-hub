import { create } from 'zustand';
import { apiService } from '../services/api';
import { decodeJWT } from '../utils/jwt';

interface AuthState {
  isAuthenticated: boolean;
  userRole: string | null;
  token: string | null;
  error: string | null;
  isLoading: boolean;
  connectionStatus: {
    isConnected: boolean;
    language: string | null;
  };
  login: (login: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: !!localStorage.getItem('token'),
  userRole: null,
  token: localStorage.getItem('token'),
  error: null,
  isLoading: false,
  connectionStatus: {
    isConnected: false,
    language: null
  },

  login: async (login: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await apiService.login({ login, password });

      if (response.statusCode === 200 && response.data) {
        const token = response.data;
        localStorage.setItem('token', token);
        
				// Decode the JWT token, get the role
        const decodedToken = decodeJWT(token);
        const userRole = decodedToken?.role || null;
        
        set({
          isAuthenticated: true,
          token: token,
          userRole: userRole,
          error: null
        });
      } else {
        throw new Error(response.message || 'Authentication failed');
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        isAuthenticated: false,
        token: null,
        userRole: null
      });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ 
      token: null, 
      userRole: null, 
      error: null, 
      isLoading: false, 
      isAuthenticated: false 
    });
  },

  clearError: () => set({ error: null })
}));