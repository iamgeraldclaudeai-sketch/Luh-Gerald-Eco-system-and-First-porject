"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

interface StoredUser {
  email: string;
  passwordHash: string;
}

interface AuthUser {
  email: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signup: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
}

const USERS_KEY = "ecosystem_auth_users";
const SESSION_KEY = "ecosystem_auth_session";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`luh-gerald-ecosystem::${password}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function readUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? (JSON.parse(raw) as StoredUser[]) : [];
  } catch {
    return [];
  }
}

function writeUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) {
      try {
        setUser(JSON.parse(raw) as AuthUser);
      } catch {
        localStorage.removeItem(SESSION_KEY);
      }
    }
    setLoading(false);
  }, []);

  async function signup(email: string, password: string) {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      return { ok: false, error: "Email and password are required." };
    }
    const users = readUsers();
    if (users.some((u) => u.email === normalizedEmail)) {
      return { ok: false, error: "An account with that email already exists." };
    }
    const passwordHash = await hashPassword(password);
    users.push({ email: normalizedEmail, passwordHash });
    writeUsers(users);
    const sessionUser = { email: normalizedEmail };
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
    setUser(sessionUser);
    return { ok: true };
  }

  async function login(email: string, password: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const users = readUsers();
    const match = users.find((u) => u.email === normalizedEmail);
    if (!match) {
      return { ok: false, error: "No account found with that email." };
    }
    const passwordHash = await hashPassword(password);
    if (match.passwordHash !== passwordHash) {
      return { ok: false, error: "Incorrect password." };
    }
    const sessionUser = { email: normalizedEmail };
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
    setUser(sessionUser);
    return { ok: true };
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
