import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, remember: boolean) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // NOVO: Função para verificar o status do login no backend
  const checkLoginStatus = async () => {
    try {
      const response = await fetch('/api/status', {
        method: 'GET',
        credentials: 'include'
      });
      const result = await response.json();
      if (result.isAuthenticated) {
        setUser(result.user);
        // Persiste o estado do usuário no localStorage
        localStorage.setItem('user', JSON.stringify(result.user));
      }
    } catch (error) {
      console.error('Erro ao verificar o status de login:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const login = async (email: string, password: string, remember: boolean): Promise<boolean> => {
    setLoading(true);
    try {
      // Faz a chamada real para a API de login do backend
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });

      const result = await response.json();

      if (response.ok) {
        setUser(result.user);
        // Persiste o estado do usuário no localStorage
        localStorage.setItem('user', JSON.stringify(result.user));
        setLoading(false);
        return true;
      } else {
        console.error('Login failed:', result.message);
        setLoading(false);
        return false;
      }
    } catch (error) {
      console.error('Erro no login:', error);
      setLoading(false);
      return false;
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Erro no logout:', error);
    }
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};