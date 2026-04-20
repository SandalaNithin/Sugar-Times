"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { authAPI, subscriptionsAPI } from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  // Rehydrate from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (stored && token) {
      const parsed = JSON.parse(stored);
      setUser(parsed);
      fetchSubscription(parsed.id || parsed._id);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchSubscription = async (userId) => {
    if (!userId) { setLoading(false); return; }
    try {
      const { data } = await subscriptionsAPI.getByUser(userId);
      // Only set subscription if data has a valid _id and is not "none" status
      const isValid = data && data._id && data.status !== "none";
      setSubscription(isValid ? data : null);
    } catch {
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
    await fetchSubscription(data.user.id || data.user._id);
    return data.user;
  };

  const register = async (name, email, password) => {
    const { data } = await authAPI.register({ name, email, password });
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
    setLoading(false);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setSubscription(null);
  };

  const guestRegister = async (name, email) => {
    const { data } = await authAPI.guestRegister({ name, email });
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
    setLoading(false);
    return data; // Returns { token, user, generatedPassword }
  };

  const updateLocalUser = (updates) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem("user", JSON.stringify(updated));
  };

  const isAdmin = user?.role === "admin";
  const isSubscribed = !!subscription;

  return (
    <AuthContext.Provider value={{ 
      user, subscription, loading, isAdmin, isSubscribed, 
      login, register, logout, fetchSubscription, guestRegister, updateLocalUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
