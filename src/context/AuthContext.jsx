import { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, logout as logoutApi } from '../api/auth';
import GeneratedUsernameModal from '../components/auth/GeneratedUsernameModal';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatedUsernameModal, setGeneratedUsernameModal] = useState(null);

  const hydrateUser = async () => {
    const token = localStorage.getItem('dos_access_token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const data = await getCurrentUser();
      setUser(data.user);
    } catch (err) {
      localStorage.removeItem('dos_access_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const pendingModal = sessionStorage.getItem('dos_show_username_modal');
    if (pendingModal) {
      setGeneratedUsernameModal(pendingModal);
    }
    hydrateUser();
  }, []);

  const loginUser = (token, userData, usernameGenerated = false) => {
    localStorage.setItem('dos_access_token', token);
    setUser(userData);
    if ((usernameGenerated === true || usernameGenerated === 'true') && userData?.username) {
      setGeneratedUsernameModal(userData.username);
      sessionStorage.setItem('dos_show_username_modal', userData.username);
    }
  };

  const closeGeneratedUsernameModal = () => {
    setGeneratedUsernameModal(null);
    sessionStorage.removeItem('dos_show_username_modal');
  };

  const logout = async () => {
    try {
      await logoutApi();
    } catch (err) {
      console.error("Logout API error:", err);
    } finally {
      localStorage.removeItem('dos_access_token');
      sessionStorage.removeItem('dos_show_username_modal');
      setUser(null);
      setGeneratedUsernameModal(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        logout,
        login: loginUser,
        generatedUsernameModal,
        showGeneratedUsernameModal: (username) => setGeneratedUsernameModal(username),
        closeGeneratedUsernameModal,
      }}
    >
      {children}
      <GeneratedUsernameModal
        isOpen={Boolean(generatedUsernameModal)}
        username={generatedUsernameModal || ''}
        onClose={closeGeneratedUsernameModal}
      />
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);