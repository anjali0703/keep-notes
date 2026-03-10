import React, { createContext, useContext, useState } from "react";

const ViewContext = createContext();

export const ViewProvider = ({ children }) => {

  const [viewMode, setViewMode] = useState(
    localStorage.getItem("notesView") || "grid"
  );

  const toggleView = () => {
    const newMode = viewMode === "grid" ? "list" : "grid";
    setViewMode(newMode);
    localStorage.setItem("notesView", newMode);
  };

  return (
    <ViewContext.Provider value={{ viewMode, toggleView }}>
      {children}
    </ViewContext.Provider>
  );
};

export const useView = () => {
  return useContext(ViewContext);
};