import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getToken, removeToken } from "../api/api";

// Create the context container that will hold our auth data
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // 'booting' is true while we check the phone's storage for an existing token
  const [booting, setBooting] = useState(true);
  // 'isAuthed' is the source of truth for whether the user sees the Login or Drive screen
  const [isAuthed, setIsAuthed] = useState(false);

  // This runs exactly once when the app first opens
  useEffect(() => {
    (async () => {
      try {
        // Look in AsyncStorage for a saved token from a previous session
        const token = await getToken();
        // The !! converts the token string into a simple true/false
        setIsAuthed(!!token);
      } finally {
        // Once the check is done, we stop booting (this hides any splash screen)
        setBooting(false);
      }
    })();
  }, []);

  // useMemo 'freezes' this object so it only updates when booting or isAuthed changes.
  // This prevents unnecessary screen re-renders, making the app faster.
  const value = useMemo(
    () => ({
      booting,
      isAuthed,
      // Helper function to manually set the auth status (used after Login)
      setAuthed: (v) => setIsAuthed(!!v),
      // Clean up function: deletes the token from storage and updates the state
      logout: async () => {
        await removeToken();
        setIsAuthed(false);
      },
    }),
    [booting, isAuthed]
  );

  // We wrap the entire app in this Provider so any component can 'tune in' to the auth state
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to make it easy for other components to access the auth data
export function useAuth() {
  const ctx = useContext(AuthContext);
  // If useAuth is called outside of the AuthProvider, it will throw a clear error
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}