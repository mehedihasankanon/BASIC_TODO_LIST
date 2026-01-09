import React, { Fragment } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import "./App.css";


// components

import InputTodo from "./components/InputTodo";
import ListTodo from "./components/ListTodo";
import UserLogin from "./components/UserLogin";
import UserRegister from "./components/UserRegister";
import PrivateRoute from "./components/PrivateRoute";

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <PrivateRoute>
              <InputTodo />
              <ListTodo />
            </PrivateRoute>
          }
        />
        <Route path="/login" element={<UserLogin />} />
        <Route path="/register" element={<UserRegister />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App;
