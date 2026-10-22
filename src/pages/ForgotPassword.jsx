import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ForgotPassword() {
  // Prevent standalone forgot password page and redirect to login with in-modal experience
  return <Navigate to="/login?forgot=true" replace />;
}
