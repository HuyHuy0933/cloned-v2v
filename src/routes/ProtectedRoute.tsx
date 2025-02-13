import React, { ReactNode } from "react";
import { Navigate, Route, RouteProps } from "react-router-dom";

type ProtectedRouteProps = {
  element: ReactNode;
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  element,
}) => {
  const token = localStorage.getItem("token");

  // if (!token) return <Navigate to="/login" replace />;

  return element;
};

export default ProtectedRoute;
