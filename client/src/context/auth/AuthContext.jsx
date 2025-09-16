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
          // Handle new user service response structure
          const userData = validToken.user;
          const user = {
            userID: userData.userID || userData.id,
            user_code: userData.userID || userData.id, // For backward compatibility
            username: userData.username,
            email: userData.email,
            role: userData.role,
            type: userData.role, // For backward compatibility
            first_name: userData.first_name,
            last_name: userData.last_name,
            phone: userData.phone,
            address: userData.address,
            branch: userData.branch
          }
          setUser(user);
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
      // Handle new user service response structure
      const userData = isValid.user.data || isValid.user;
      const user = {
        userID: userData.user?.userID || userData.userID,
        user_code: userData.user?.userID || userData.userID, // For backward compatibility
        username: userData.user?.username || userData.username,
        email: userData.user?.email || userData.email,
        role: userData.user?.role || userData.role,
        type: userData.user?.role || userData.role, // For backward compatibility
        first_name: userData.user?.first_name || userData.first_name,
        last_name: userData.user?.last_name || userData.last_name,
        phone: userData.user?.phone || userData.phone,
        address: userData.user?.address || userData.address,
        branch: userData.user?.branch || userData.branch
      }
      console.log("Setting user in AuthContext:", user);
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
