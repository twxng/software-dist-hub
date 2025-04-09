import { create } from 'zustand';
import { apiService } from '../services/api';
import { decodeJWT } from '../utils/jwt';
import { userService } from '../services/userService';
import { UserProfile, UpdateProfileRequest } from '../types/api.types';

interface AuthState {
  isAuthenticated: boolean;
  userRole: string | null;
  token: string | null;
  error: string | null;
  isLoading: boolean;
  user: UserProfile | null;
  connectionStatus: {
    isConnected: boolean;
    language: string | null;
  };
  login: (login: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  loadUserProfile: () => Promise<void>;
  updateUserProfile: (data: UpdateProfileRequest) => Promise<boolean>;
  uploadAvatar: (file: File) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  deleteAccount: () => Promise<boolean>;
  checkAuthStatus: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => {
  // Отримуємо токен з localStorage
  const token = localStorage.getItem('token');
  
  // Перевіряємо, чи є збережені дані користувача
  const savedUser = localStorage.getItem('user');
  let initialUser: UserProfile | null = null;
  
  if (savedUser) {
    try {
      initialUser = JSON.parse(savedUser);
    } catch (e) {
      console.error('Error parsing saved user data:', e);
    }
  }
  
  // Якщо є токен, декодуємо його для отримання ролі
  let initialUserRole = null;
  if (token) {
    const decodedToken = decodeJWT(token);
    initialUserRole = decodedToken?.Role || null;
    
    // Якщо немає збережених даних користувача, але є token, створюємо базові дані
    if (!initialUser && decodedToken) {
      initialUser = {
        id: decodedToken.Id || decodedToken.id || '1',
        login: decodedToken.Login || decodedToken.login || 'user',
        roleName: decodedToken.Role || initialUserRole || 'User'
      };
    }
  }
  
  return {
    isAuthenticated: !!token,
    userRole: initialUserRole,
    token: token,
    user: initialUser,
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
          
          const decodedToken = decodeJWT(token);
          const userRole = decodedToken?.Role || null;
          
          console.log('Decoded token:', decodedToken);
          console.log('User role:', userRole);
          
          // Створюємо базові дані користувача з токену
          const user: UserProfile = {
            id: decodedToken?.Id || decodedToken?.id || '1',
            login: login,
            roleName: decodedToken?.Role || userRole || 'User',
            createdAt: new Date().toISOString()
          };
          
          // Зберігаємо дані користувача
          localStorage.setItem('user', JSON.stringify(user));
          
          set({
            isAuthenticated: true,
            token: token,
            userRole: userRole,
            user: user,
            error: null
          });

          console.log('State after login:', {
            isAuthenticated: true,
            userRole: userRole,
            token: token.substring(0, 20) + '...',
            user
          });
          
          // Завантажуємо повний профіль користувача
          get().loadUserProfile();
        } else {
          throw new Error(response.message || 'Authentication failed');
        }
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'Unknown error',
          isAuthenticated: false,
          token: null,
          userRole: null,
          user: null
        });
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },

    logout: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({ 
        token: null, 
        userRole: null, 
        error: null, 
        isLoading: false, 
        isAuthenticated: false,
        user: null 
      });
    },

    clearError: () => set({ error: null }),
    
    loadUserProfile: async () => {
      try {
        set({ isLoading: true });
        const response = await userService.getProfile();
        
        if (response.statusCode === 200 && response.data) {
          // Зберігаємо отримані дані
          const userData = response.data;
          
          // Якщо в отриманих даних немає деяких полів, але вони є в збережених даних,
          // зберігаємо ці поля
          const currentUser = get().user;
          if (currentUser) {
            if (!userData.avatar && currentUser.avatar) {
              userData.avatar = currentUser.avatar;
            }
            if (!userData.email && currentUser.email) {
              userData.email = currentUser.email;
            }
          }
          
          localStorage.setItem('user', JSON.stringify(userData));
          set({ user: userData });
        } else {
          console.error('Error loading user profile:', response.message);
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
      } finally {
        set({ isLoading: false });
      }
    },
    
    updateUserProfile: async (data: UpdateProfileRequest) => {
      try {
        set({ isLoading: true });
        const response = await userService.updateProfile(data);
        
        if (response.statusCode === 200 && response.data) {
          const updatedUser = response.data;
          
          // Зберігаємо оновлені дані
          localStorage.setItem('user', JSON.stringify(updatedUser));
          set({ user: updatedUser });
          
          return true;
        } else {
          set({ error: response.message || 'Error updating profile' });
          return false;
        }
      } catch (error) {
        set({ error: error instanceof Error ? error.message : 'Error updating profile' });
        return false;
      } finally {
        set({ isLoading: false });
      }
    },
    
    uploadAvatar: async (file: File) => {
      try {
        set({ isLoading: true });
        const response = await userService.uploadAvatar(file);
        
        if (response.statusCode === 200 && response.data) {
          // Оновлюємо аватар у сховищі
          const currentUser = get().user;
          if (currentUser) {
            const updatedUser = { ...currentUser, avatar: response.data };
            set({ user: updatedUser });
            localStorage.setItem('user', JSON.stringify(updatedUser));
          }
          
          return true;
        } else {
          set({ error: response.message || 'Error uploading avatar' });
          return false;
        }
      } catch (error) {
        set({ error: error instanceof Error ? error.message : 'Error uploading avatar' });
        return false;
      } finally {
        set({ isLoading: false });
      }
    },
    
    changePassword: async (currentPassword: string, newPassword: string) => {
      try {
        set({ isLoading: true });
        const response = await userService.changePassword(currentPassword, newPassword);
        
        if (response.statusCode === 200 && response.data) {
          return true;
        } else {
          set({ error: response.message || 'Error changing password' });
          return false;
        }
      } catch (error) {
        set({ error: error instanceof Error ? error.message : 'Error changing password' });
        return false;
      } finally {
        set({ isLoading: false });
      }
    },
    
    deleteAccount: async () => {
      try {
        set({ isLoading: true });
        const response = await userService.deleteAccount();
        
        if (response.statusCode === 200 && response.data) {
          // Якщо акаунт видалено успішно, виходимо з системи
          get().logout();
          return true;
        } else {
          set({ error: response.message || 'Error deleting account' });
          return false;
        }
      } catch (error) {
        set({ error: error instanceof Error ? error.message : 'Error deleting account' });
        return false;
      } finally {
        set({ isLoading: false });
      }
    },
    
    checkAuthStatus: () => {
      console.log('Checking authentication status...');
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      if (!token) {
        console.log('No token found, logging out');
        get().logout();
        return;
      }
      
      // Перевіряємо, чи токен не закінчився
      try {
        const decoded = decodeJWT(token);
        const now = Date.now() / 1000;
        
        // Якщо є поле exp і час закінчення токену менший за поточний
        if (decoded && decoded.exp && decoded.exp < now) {
          console.log('Token expired, logging out');
          get().logout();
          return;
        }
        
        // Якщо роль у токені відрізняється від поточної, оновлюємо
        if (decoded && decoded.Role && decoded.Role !== get().userRole) {
          console.log(`Updating role from ${get().userRole} to ${decoded.Role}`);
          set({ userRole: decoded.Role });
        }
        
        // Якщо немає даних користувача, але є токен, створюємо базові дані
        if (!savedUser && decoded) {
          const user: UserProfile = {
            id: decoded.Id || decoded.id || '1',
            login: decoded.Login || decoded.login || 'user',
            roleName: decoded.Role || get().userRole || 'User',
            createdAt: new Date().toISOString()
          };
          
          localStorage.setItem('user', JSON.stringify(user));
          set({ user: user });
        }
        
        // Якщо є токен, але немає статусу авторизації, встановлюємо його
        if (!get().isAuthenticated) {
          console.log('Setting authenticated state to true');
          set({ isAuthenticated: true, token: token });
        }
        
        // Завантажуємо профіль користувача
        get().loadUserProfile();
      } catch (error) {
        console.error('Error checking token:', error);
        get().logout();
      }
    }
  };
});