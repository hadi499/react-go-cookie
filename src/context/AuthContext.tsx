// AuthContext.tsx
import { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import type { ReactNode, FormEvent } from "react";

// Tipe user response dari login
interface UserResponse {
  [key: string]: any; // Bisa menerima response login apapun
}

// Tipe context
interface AuthContextType {
  user: UserResponse | null;
  // loading: Boolean;
  loginUser: (e: FormEvent<HTMLFormElement>) => Promise<void>;
  logoutUser: () => Promise<void>;
}

// Buat context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export default AuthContext;

// Provider
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const navigate = useNavigate();

  // Simpan response login langsung ke localStorage
  const [user, setUser] = useState<UserResponse | null>(() => {
    const storedUser = localStorage.getItem("userInfo");
    if (storedUser) {
      try {
        return JSON.parse(storedUser) as UserResponse;
      } catch (error) {
        console.error("Error parsing stored user info:", error);
        localStorage.removeItem("userInfo"); // Clean up invalid data
        return null;
      }
    }
    return null;
  });

  const [loading, setLoading] = useState(true);

  const loginUser = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const username = (form.elements.namedItem("username") as HTMLInputElement)
      .value;
    const password = (form.elements.namedItem("password") as HTMLInputElement)
      .value;

    const response = await fetch("http://localhost:8080/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
      credentials: "include", // agar cookie diset
    });
    let data = await response.json();
    console.log(data);

    if (response.status === 200) {
      // Simpan seluruh response user ke state dan localStorage
      const userData: UserResponse = data.user;
      setUser(userData);
      localStorage.setItem("userInfo", JSON.stringify(userData));
    } else {
      throw new Error(data.message || "Username or Password wrong.");
    }
  };

  const logoutUser = async () => {
    await fetch("http://localhost:8080/logout", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // kirim cookie untuk logout server
    });

    setUser(null);
    localStorage.removeItem("userInfo"); // Clean up localStorage
    navigate("/login");
  };

  // Fix: Make sure loading is properly handled
  useEffect(() => {
    setLoading(false);
  }, []);

  const contextData: AuthContextType = {
    // loading: loading,
    user: user,
    loginUser: loginUser,
    logoutUser: logoutUser,
  };

  return (
    <AuthContext.Provider value={contextData}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
