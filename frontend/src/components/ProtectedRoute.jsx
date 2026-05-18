import React from 'react';

/**
 * Route protection wrapper.
 * Inspects localStorage for user authentication keys.
 * If missing, routes unauthenticated attempts back to the authorization panel.
 */
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    // Redirect cleanly. For simple MERN architectures, mounting login components
    // directly if unauthenticated preserves state and works flawlessly.
    window.location.href = '#/login';
    return null;
  }

  return children;
};

export default ProtectedRoute;
