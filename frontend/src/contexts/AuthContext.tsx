import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export interface User {
  User_id: number;
  Doctor_id?: number;
  Slot_id?: number;
  Appointment_id?: number;
  Email: string;
  User_Type: 'Patient' | 'Doctor' | 'Pharmacist' | 'Admin';
  First_Name: string;
  Last_Name: string;
}

interface AuthContextType {
  user: User | null;
  doctor?: User | null;
  isAuthenticated: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const setCookie = (name: string, value: string, days: number = 7) => {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Strict`;
};

const getCookie = (name: string): string | null => {
  return document.cookie.split('; ').reduce((r, v) => {
    const parts = v.split('=');
    return parts[0] === name ? decodeURIComponent(parts[1]) : r;
  }, '');
};

const deleteCookie = (name: string) => {
  setCookie(name, '', -1);
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    const token = getCookie('authToken');
    const userData = getCookie('userData');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error('Failed to parse user data from cookie:', error);
        logout();
      }
    }
    setLoading(false);
  }, []);

  const login = (token: string, userData: User) => {
    setCookie('authToken', token);
    setCookie('userData', JSON.stringify(userData));
    setUser(userData);
    localStorage.setItem('authToken', token);
    localStorage.setItem('currentUser', JSON.stringify(userData));
  };

  const logout = () => {
    deleteCookie('authToken');
    deleteCookie('userData');
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('currentDoctor');
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};