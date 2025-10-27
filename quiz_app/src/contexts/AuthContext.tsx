import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  email: string;
  username: string;
  fullName: string;
  avatar?: string;
  totalScore: number;
  level: number;
  achievements: string[];
  joinedAt: string;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, username: string, fullName: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  isLoading: boolean;
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('quiz_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Mock authentication - in real app, this would call your backend
    const mockUsers = JSON.parse(localStorage.getItem('quiz_users') || '[]');
    const foundUser = mockUsers.find((u: any) => u.email === email && u.password === password);
    
    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('quiz_user', JSON.stringify(userWithoutPassword));
      setIsLoading(false);
      return true;
    }
    
    // Check for admin credentials
    if (email === 'admin@quiz.com' && password === 'admin123') {
      const adminUser: User = {
        id: 'admin-1',
        email: 'admin@quiz.com',
        username: 'admin',
        fullName: 'Quiz Administrator',
        totalScore: 0,
        level: 1,
        achievements: [],
        joinedAt: new Date().toISOString(),
        isAdmin: true
      };
      setUser(adminUser);
      localStorage.setItem('quiz_user', JSON.stringify(adminUser));
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const register = async (email: string, password: string, username: string, fullName: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Mock registration
    const mockUsers = JSON.parse(localStorage.getItem('quiz_users') || '[]');
    
    // Check if user already exists
    if (mockUsers.some((u: any) => u.email === email || u.username === username)) {
      setIsLoading(false);
      return false;
    }
    
    const newUser: User & { password: string } = {
      id: `user-${Date.now()}`,
      email,
      username,
      fullName,
      password,
      totalScore: 0,
      level: 1,
      achievements: [],
      joinedAt: new Date().toISOString(),
      isAdmin: false
    };
    
    mockUsers.push(newUser);
    localStorage.setItem('quiz_users', JSON.stringify(mockUsers));
    
    const { password: _, ...userWithoutPassword } = newUser;
    setUser(userWithoutPassword);
    localStorage.setItem('quiz_user', JSON.stringify(userWithoutPassword));
    
    setIsLoading(false);
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('quiz_user');
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('quiz_user', JSON.stringify(updatedUser));
      
      // Update in users array too
      const mockUsers = JSON.parse(localStorage.getItem('quiz_users') || '[]');
      const userIndex = mockUsers.findIndex((u: any) => u.id === user.id);
      if (userIndex !== -1) {
        mockUsers[userIndex] = { ...mockUsers[userIndex], ...updates };
        localStorage.setItem('quiz_users', JSON.stringify(mockUsers));
      }
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      updateUser,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
};