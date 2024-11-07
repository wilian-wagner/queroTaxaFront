import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from 'react-router-dom';
import "./App.css";

import AuthService from "./services/auth.service";
import "bootstrap/dist/css/bootstrap.min.css";
import Login from "./components/Login";
import Register from "./components/Register";
import Home from "./components/Home";
import Profile from "./components/Profile";
import BoardUser from "./components/BoardUser";
import BoardModerator from "./components/BoardModerator";
import BoardAdmin from "./components/BoardAdmin";

import EventBus from "./common/EventBus";

const ProtectedRoute = ({ children }) => {
  const user = AuthService.getCurrentUser();
  return user ? children : <Navigate to="/login" />;
};

const App = () => {
  const [showModeratorBoard, setShowModeratorBoard] = useState(false);
  const [showAdminBoard, setShowAdminBoard] = useState(false);
  const [currentUser, setCurrentUser] = useState(undefined);

  useEffect(() => {
    const user = AuthService.getCurrentUser();

    if (user && user.roles) {  
      setCurrentUser(user);
      setShowModeratorBoard(user.roles.includes("ROLE_MODERATOR"));
      setShowAdminBoard(user.roles.includes("ROLE_ADMIN"));
    }

    EventBus.on("logout", () => {
      logOut();
    });

    return () => {
      EventBus.remove("logout");
    };
  }, []);

  const logOut = () => {
    AuthService.logout();
    setShowModeratorBoard(false);
    setShowAdminBoard(false);
    setCurrentUser(undefined);
  };

  return (
    <div>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Rota protegida */}
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/user" element={<ProtectedRoute><BoardUser /></ProtectedRoute>} />
        <Route path="/mod" element={<ProtectedRoute><BoardModerator /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><BoardAdmin /></ProtectedRoute>} />
        
        {/* Redireciona para /login caso nenhuma rota seja encontrada */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </div>
  );
};

export default App;
