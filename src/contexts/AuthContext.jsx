import { useState, useEffect, useCallback } from "react";
import { authAPI, twoFactorAPI, testConnection, fetchCsrfToken } from "../services/api";
import toast from "react-hot-toast";
import PropTypes from "prop-types";
import { AuthContext } from "./AuthContextUtils";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [backendConnected, setBackendConnected] = useState(false);

  const checkAuth = useCallback(async () => {
    const savedToken = localStorage.getItem("token");

    if (!savedToken) {
      setLoading(false);
      return;
    }

    // Try real API
    try {
      const response = await authAPI.getMe();
      setUser(response.data.user);
      setToken(savedToken);
    } catch (error) {
      console.error("Auth check failed:", error);
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    checkBackendConnection();
    checkAuth();
  }, [checkAuth]);

  const checkBackendConnection = async () => {
    try {
      const result = await testConnection();
      setBackendConnected(result.success);
      if (result.success) {
        console.log("✅ Backend connected successfully");
        // Initialize CSRF token for future requests
        try {
          await fetchCsrfToken();
          console.log("✅ CSRF token initialized");
        } catch (error) {
          console.warn("⚠️ CSRF token initialization failed:", error.message);
        }
      } else {
        console.error("❌ Backend connection failed");
        toast.error("Unable to connect to server. Please try again later.");
      }
    } catch (error) {
      console.error("❌ Backend connection failed:", error);
      setBackendConnected(false);
      toast.error("Unable to connect to server. Please try again later.");
    }
  };

  const login = async (credentials) => {
    try {
      await fetchCsrfToken(); // Ensure CSRF token is set
      const response = await authAPI.login(credentials);
      
      // Check if 2FA is required
      if (response.data?.data?.twoFARequired) {
        return { 
          success: true, 
          twoFARequired: true,
          tempToken: response.data.data.tempToken,
          email: credentials.email
        };
      }

      // Regular login flow
      const { accessToken: newToken, user: userData } = response.data.data;
      localStorage.setItem("token", newToken);
      setToken(newToken);
      setUser(userData);

      toast.success(`Welcome back, ${userData.fullName}!`);
      return { 
        success: true, 
        user: userData,
        twoFARequired: false
      };
    } catch (error) {
      const message = error.response?.data?.message || "Login failed";
      toast.error(message);
      return { 
        success: false, 
        error: message,
        twoFARequired: false
      };
    }
  };

  // Verify 2FA token during login
  const verify2FALogin = async (email, token, isRecoveryCode = false) => {
    try {
      let response;
      
      if (isRecoveryCode) {
        response = await twoFactorAPI.verifyRecoveryCode(email, token);
      } else {
        response = await twoFactorAPI.verifyLogin(email, token);
      }
      
      // Check for the correct response structure
      if (response.data?.success && response.data?.data?.accessToken) {
        const { accessToken: newToken, refreshToken } = response.data.data;
        
        localStorage.setItem("token", newToken);
        if (refreshToken) {
          localStorage.setItem("refreshToken", refreshToken);
        }
        setToken(newToken);
        
        // Fetch user data since it's not returned in 2FA verification
        try {
          const userResponse = await authAPI.getMe();
          setUser(userResponse.data.user);
          toast.success(`Welcome back, ${userResponse.data.user.fullName}!`);
          return { 
            success: true, 
            user: userResponse.data.user,
            accessToken: newToken
          };
        } catch (userError) {
          console.error('Failed to fetch user data:', userError);
          // Still return success but without user data
          return { 
            success: true, 
            accessToken: newToken
          };
        }
      }
      
      throw new Error('Invalid verification code');
    } catch (error) {
      const message = error.response?.data?.message || "Verification failed. Please try again.";
      toast.error(message);
      return { 
        success: false, 
        error: message 
      };
    }
  };

  const register = async (userData) => {
    try {
      await fetchCsrfToken(); // Ensure CSRF token is set
      const response = await authAPI.register(userData);
      const { accessToken: newToken, user: newUser } = response.data.data;

      localStorage.setItem("token", newToken);
      setToken(newToken);
      setUser(newUser);

      toast.success(`Welcome to MicroHire, ${newUser.fullName}!`);
      return { success: true };
    } catch (error) {
      // Handle CSRF errors specifically
      if (error.response?.data?.code === "EBADCSRFTOKEN") {
        toast.error(
          "Security token expired. Please refresh the page and try again."
        );
        return { success: false, error: "CSRF token expired" };
      }

      const message = error.response?.data?.message || "Registration failed";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      await fetchCsrfToken(); // Ensure CSRF token is set
      if (token) {
        await authAPI.logout();
      }
    } catch (error) {
      console.warn("Logout API call failed:", error);
    } finally {
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
      toast.success("Logged out successfully");
    }
  };

  const updateUser = (userData) => {
    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
  };

  const forgotPassword = async (email) => {
    try {
      await authAPI.forgotPassword(email);
      toast.success("Password reset link sent to your email");
      return { success: true };
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to send reset link";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const resetPassword = async (token, password) => {
    try {
      await authAPI.resetPassword(token, password);
      toast.success("Password reset successfully");
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Password reset failed";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const value = {
    user,
    loading,
    token,
    backendConnected,
    login,
    verify2FALogin,
    register,
    logout,
    updateUser,
    forgotPassword,
    resetPassword,
    isAuthenticated: !!user,
    isStudent: user?.role === "student",
    isBusiness: user?.role === "business",
    isAdmin: user?.role === "admin",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
