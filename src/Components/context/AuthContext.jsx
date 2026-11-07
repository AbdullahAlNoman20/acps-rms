import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../services/api";
import { dataStore } from "../services/dataStore";
import { useCollection } from "../hooks/useCollection";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => dataStore.getSession());
  const { items: permissions } = useCollection("permissions");

  // sign out automatically if the account is deleted or switched off
  useEffect(() => {
    if (!user) return;
    api.get("users", user.id).then((u) => { if (!u || u.status !== "Active") { dataStore.clearSession(); setUser(null); } });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const login = useCallback(async (email, password) => {
    const users = await api.list("users");
    const u = users.find((x) => x.email.toLowerCase() === String(email).trim().toLowerCase() && x.password === password);
    if (!u) return { success: false, message: "Email or password is not correct." };
    if (u.status !== "Active") return { success: false, message: "This account is switched off. Please contact the IT Head." };
    const session = { id: u.id, name: u.name, role: u.role, email: u.email, teacherId: u.teacherId || "", studentId: u.studentId || "", avatarColor: u.avatarColor };
    dataStore.setSession(session); setUser(session);
    api.audit("login", "users", u.id, "Signed in");
    return { success: true, user: session };
  }, []);

  const logout = useCallback(() => { dataStore.clearSession(); setUser(null); }, []);

  const can = useCallback((perm) => {
    if (!user) return false;
    if (!perm) return true;
    if (user.role === "it_head") return true;
    const row = permissions.find((p) => p.key === perm);
    return !!row?.roles?.[user.role];
  }, [user, permissions]);

  const value = useMemo(() => ({ user, login, logout, can }), [user, login, logout, can]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
