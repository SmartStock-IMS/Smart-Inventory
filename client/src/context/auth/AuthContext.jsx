import { createContext, useContext, useEffect, useState } from "react";
import { userLogin, validateUser } from "../../services/auth-service.js";

const AuthContext = createContext({});

// eslint-disable-next-line react/prop-types
export const AuthContextProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const validToken = await validateUser(token);
        if (validToken.success) {
          console.log("validate token user data: ", validToken.user);
          setUser(validToken.user);
          setIsAuthenticated(true);
        } else {
          logout();
        }
      } catch (error) {
        console.error("Token validation error:", error);
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    checkToken();
  }, []);

  const login = async (username, password) => {
    const isValid = await userLogin(username, password);
    if (isValid.success) {
      setIsAuthenticated(true);
      const user = {
        user_code: isValid.user.data.user_code,
        type: isValid.user.data.user_type,
      }
      setUser(user);
      return isValid.user;
    }

    return null;
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("cart");
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, isLoading, user, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
