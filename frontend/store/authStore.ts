import { create } from "zustand";

interface AuthState {
  token: string | null;

  setToken: (token: string) => void;

  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token:
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null,

  setToken(token) {
    if (typeof window !== "undefined") {
      localStorage.setItem("token", token);
    }

    set({
      token,
    });
  },

  logout() {
    if (typeof window !== "undefined") {
      // Remove authentication data
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Optional: clear any other cached data
      // localStorage.removeItem("wallet");
      // localStorage.removeItem("positions");
    }

    set({
      token: null,
    });
  },
}));