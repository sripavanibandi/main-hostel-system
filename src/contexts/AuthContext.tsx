import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiClient } from '@/api/client';

type UserRole = 'admin' | 'student' | null;

interface User {
  id: string;
  email: string;
  name: string;
  fullName?: string;
  rollNumber?: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  session: { token: string } | null;
  role: UserRole;
  profile: { roll_number: string; full_name: string } | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; fullName: string; rollNumber: string; name?: string }) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<{ token: string } | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [profile, setProfile] = useState<{ roll_number: string; full_name: string } | null>(null);
  const [loading, setLoading] = useState(true);

  // Decode JWT token to get user info (client-side only, for initial state)
  const decodeToken = (token: string): { id: string; email: string; role: UserRole } | null => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      return null;
    }
  };

  // Fetch current user from backend
  const fetchCurrentUser = async () => {
    try {
      const userData = await apiClient.get<User>('/api/me');
      setUser(userData);
      setRole(userData.role);
      if (userData.rollNumber && userData.fullName) {
        setProfile({
          roll_number: userData.rollNumber,
          full_name: userData.fullName,
        });
      } else {
        setProfile(null);
      }
    } catch (error) {
      // Token invalid or expired, clear it
      localStorage.removeItem('authToken');
      setUser(null);
      setSession(null);
      setRole(null);
      setProfile(null);
    }
  };

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('authToken');
      
      if (token) {
        const decoded = decodeToken(token);
        if (decoded) {
          // Set initial state from token
          setSession({ token });
          setRole(decoded.role);
          
          // Fetch full user data from backend
          await fetchCurrentUser();
        } else {
          // Invalid token, clear it
          localStorage.removeItem('authToken');
        }
      }
      
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.post<{ token: string; user: User }>('/api/login', {
        email,
        password,
      });

      const { token, user: userData } = response;
      
      // Store token
      localStorage.setItem('authToken', token);
      
      // Update state
      setSession({ token });
      setUser(userData);
      setRole(userData.role);
      
      if (userData.rollNumber && userData.fullName) {
        setProfile({
          roll_number: userData.rollNumber,
          full_name: userData.fullName,
        });
      } else {
        setProfile(null);
      }
    } catch (error) {
      throw error;
    }
  };

  const register = async (data: { email: string; password: string; fullName: string; rollNumber: string; name?: string }) => {
    try {
      const response = await apiClient.post<{ token: string; user: User }>('/api/register', {
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        rollNumber: data.rollNumber,
        name: data.name || data.fullName,
      });

      const { token, user: userData } = response;
      
      // Store token
      localStorage.setItem('authToken', token);
      
      // Update state
      setSession({ token });
      setUser(userData);
      setRole(userData.role);
      
      if (userData.rollNumber && userData.fullName) {
        setProfile({
          roll_number: userData.rollNumber,
          full_name: userData.fullName,
        });
      } else {
        setProfile(null);
      }
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    localStorage.removeItem('authToken');
    setUser(null);
    setSession(null);
    setRole(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, role, profile, loading, login, register, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
