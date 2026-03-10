import React, { createContext, useState, useContext, } from "react";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Check local storage for authentication state
    return localStorage.getItem("isAuthenticated") === "true";
  });

  const login = () => {
    setIsAuthenticated(true);
    localStorage.setItem("isAuthenticated", "true"); 
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("isAuthenticated"); 
    localStorage.removeItem("user"); // Remove user data from local storage

  };

  const logoutwaiter = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("isAuthenticated"); 
    localStorage.removeItem("waiter"); // Remove user data from local storage
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout,logoutwaiter }}>
      {children}
    </AuthContext.Provider>
  );
};
