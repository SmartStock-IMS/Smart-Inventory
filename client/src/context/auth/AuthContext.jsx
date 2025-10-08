import { createContext, useContext, useEffect, useState } from "react";
import { userLogin, validateUser } from "../../services/auth-service.js";

const AuthContext = createContext({});

// eslint-disable-next-line react/prop-types
export const AuthContextProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    console.log("🔍 AuthContext useEffect starting...");
    const checkToken = async () => {
      const token = localStorage.getItem("token");
      console.log("AuthContext - Token found:", !!token);
      
      if (!token) {
        console.log("❌ AuthContext - No token found, user not logged in");
        setIsLoading(false);
        return;
      }

      try {
        console.log("🔄 AuthContext - Validating token...");
        const validToken = await validateUser(token);
        console.log("AuthContext - Token validation result:", validToken);
        
        if (validToken && validToken.success) {
          console.log("✅ Token validation successful");
          console.log("validate token user data: ", validToken.user);
          
          // Ensure user has the expected structure
          const userData = validToken.user;
          
          // Check for either id or userid field
          const userId = userData?.id || userData?.userid;
          
          if (userData && userId) {
            const normalizedUser = {
              user_code: userId, // Use id/userid as user_code
              userid: userId,
              id: userId,
              type: userData.role,
              email: userData.email,
              ...userData // Include all other user data
            };
            console.log("✅ Normalized user data:", normalizedUser);
            setUser(normalizedUser);
            setIsAuthenticated(true);
          } else {
            console.error("User object missing id/userid:", userData);
            logout();
          }
        } else {
          console.log("❌ Token validation failed:", validToken?.error || 'Unknown error');
          logout();
        }
      } catch (error) {
        console.error("❌ Token validation error:", error);
        logout();
      } finally {
        console.log("🏁 AuthContext - Setting isLoading to false");
        setIsLoading(false);
      }
    };

    checkToken();
  }, []);

  const login = async (username, password) => {
    try {
      const isValid = await userLogin(username, password);
      console.log("Login response:", isValid);
      
      if (isValid.success) {
        console.log("Login successful, user data:", isValid.user);
        
        // Extract user information from login response
        const userData = isValid.user.user || isValid.user;
        const token = isValid.user.token;
        
        if (userData && token) {
          const normalizedUser = {
            user_code: userData.id,
            userid: userData.id,
            id: userData.id,
            type: userData.role,
            email: userData.email,
            username: userData.username,
            first_name: userData.first_name,
            last_name: userData.last_name,
            ...userData
          };
          
          console.log("Setting normalized user:", normalizedUser);
          setUser(normalizedUser);
          setIsAuthenticated(true);
          return isValid.user;
        } else {
          console.error("Invalid user data or missing token:", isValid.user);
          return null;
        }
      } else {
        console.error("Login failed:", isValid.message || isValid.error);
        return null;
      }
    } catch (error) {
      console.error("Login error:", error);
      return null;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    localStorage.removeItem("cart");
    setIsAuthenticated(false);
    setUser(null);
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
