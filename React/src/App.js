// src/App.js
import React, { Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import '@fortawesome/fontawesome-free/css/all.min.css';
import { ViewProvider } from "./contexts/viewContext";
import { ThemeProvider } from "./contexts/ThemeContext";


const Preloader = React.lazy(() => import("./components/layouts/Preloader"));
const Home = React.lazy(() => import("./components/pages/Home"));
const User = React.lazy(() => import("./components/pages/User"));
const LoginPage = React.lazy(() => import("./components/pages/LoginPage"));
const Notes= React.lazy(() => import("./components/pages/Notes"));
const Archive= React.lazy(() => import("./components/pages/Archive"));
const Bin= React.lazy(() => import("./components/pages/Bin"));
const Register= React.lazy(() => import("./components/pages/Register"));


const Dashboard = React.lazy(() => import("./components/pages/Dashboard"));


const AuthenticatedRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {isAuthenticated ? (
        <>
          <Route path="/notes" element={<Notes/>} />
          <Route path="*" element={<Navigate to="/Notes" />} />


           <Route path="/user" element={<User />} />
            <Route path="/notes" element={<Notes />} />
             <Route path="/Archive" element={<Archive />} />
              <Route path="/Bin" element={<Bin />} />
              <Route path="/label/:labelName" element={<Notes />} />
               <Route path="/reminder" element={<Notes />} />
     
        </>
      ) : (
        <>x\
          <Route path="/LoginPage" element={<LoginPage />} />
          <Route path="/register" element={<Register/>} />
          <Route path="*" element={<Navigate to="/LoginPage" />} />

          

        </>
      )}
    </Routes>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
       <ViewProvider>
      <Router>
        <Suspense fallback={<div></div>}>
          <Preloader />
          <AuthenticatedRoutes />
        </Suspense>
      </Router>
      </ViewProvider>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;
