import React from "react";
import { Navigate } from "react-router-dom";
import { getJwtToken } from "../utils/JWTHandler";

export default function PrivateRoute({ children }) {
  const token = getJwtToken();

  if(!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}