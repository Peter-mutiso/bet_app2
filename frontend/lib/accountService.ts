import axios from "axios";

// 1. Force production to fail if the variable is missing
const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL && process.env.NODE_ENV === 'production') {
  console.error("CRITICAL: NEXT_PUBLIC_API_URL is not set!");
}

const api = axios.create({
  baseURL: API_URL || "http://localhost:3001",
});

// 2. Add an Interceptor to attach the token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // Or wherever you store your JWT
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const accountService = {
  getProfile: async () => {
    // 3. Use the 'api' instance, not 'axios' directly
    const { data } = await api.get("/account/profile"); 
    return data;
  },
  
  processTransaction: async (type: "DEPOSIT" | "WITHDRAW", amount: number) => {
    const { data } = await api.post("/account/transaction", { type, amount });
    return data;
  }
};