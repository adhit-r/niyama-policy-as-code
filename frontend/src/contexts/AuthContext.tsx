import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../services/api';
import { User, AuthTokens, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  tokens: AuthTokens | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  organizationName: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!tokens;

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Development mode: Auto-login for testing
        if (import.meta.env.DEV) {
          const mockUser: User = {
            id: '1',
            email: 'admin@niyama.dev',
            firstName: 'Admin',
            lastName: 'User',
            organizationId: '1',
            role: UserRole.ADMIN,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          
          const mockTokens: AuthTokens = {
            accessToken: 'dev-token',
            refreshToken: 'dev-refresh-token',
            expiresIn: 3600,
          };
          
          setUser(mockUser);
          setTokens(mockTokens);
          localStorage.setItem('auth_tokens', JSON.stringify(mockTokens));
          api.setAuthToken(mockTokens.accessToken);
          setIsLoading(false);
          return;
        }

        const storedTokens = localStorage.getItem('auth_tokens');
        if (storedTokens) {
          const parsedTokens = JSON.parse(storedTokens);
          setTokens(parsedTokens);
          
          // Verify token and get user info
          api.setAuthToken(parsedTokens.accessToken);
          const userData = await api.getCurrentUser();
          setUser(userData);
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        // Clear invalid tokens
        localStorage.removeItem('auth_tokens');
        setTokens(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Auto-refresh token
  useEffect(() => {
    if (!tokens) return;

    const refreshInterval = setInterval(async () => {
      try {
        await refreshToken();
      } catch (error) {
        console.error('Token refresh failed:', error);
        logout();
      }
    }, 15 * 60 * 1000); // Refresh every 15 minutes

    return () => clearInterval(refreshInterval);
  }, [tokens]);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await api.login({ email, password });
      
      setTokens(response.tokens);
      setUser(response.user);
      
      // Store tokens in localStorage
      localStorage.setItem('auth_tokens', JSON.stringify(response.tokens));
      
      // Set auth token for API calls
      api.setAuthToken(response.tokens.accessToken);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    try {
      setIsLoading(true);
      const response = await api.register(data);
      
      setTokens(response.tokens);
      setUser(response.user);
      
      // Store tokens in localStorage
      localStorage.setItem('auth_tokens', JSON.stringify(response.tokens));
      
      // Set auth token for API calls
      api.setAuthToken(response.tokens.accessToken);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setTokens(null);
    localStorage.removeItem('auth_tokens');
    api.clearAuthToken();
  };

  const refreshToken = async () => {
    if (!tokens?.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await api.refreshToken(tokens.refreshToken);
      const newTokens = response.tokens;
      
      setTokens(newTokens);
      localStorage.setItem('auth_tokens', JSON.stringify(newTokens));
      api.setAuthToken(newTokens.accessToken);
    } catch (error) {
      logout();
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    tokens,
    login,
    register,
    logout,
    refreshToken,
    isLoading,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

