import React, {
  createContext,
  ReactNode,
  useContext,
  useState,
} from 'react';

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
};

type AuthContextType = {
  user: User | null;

  login: (
    email: string,
    password: string
  ) => Promise<boolean>;

  logout: () => void;
};

const AuthContext =
  createContext<AuthContextType>(
    {} as AuthContextType
  );

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {

  const [user, setUser] =
    useState<User | null>(null);

  const login = async (
    email: string,
    password: string
  ) => {

    try {

      const response = await fetch(
        'http://192.168.1.10:3000/auth/login',
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
          },

          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!data.success) {
        return false;
      }

      setUser(data.user);

      return true;

    } catch (error) {

      console.log(error);

      return false;

    }

  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}