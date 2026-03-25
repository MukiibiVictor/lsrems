import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE = "http://10.0.2.2:8000/api"; // Android emulator → localhost
// For physical device, replace with your machine's local IP e.g. http://192.168.x.x:8000/api

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
});

// Attach token to every request
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const authService = {
  login: async (email: string, password: string) => {
    const res = await api.post("/auth/login/", { email, password });
    await AsyncStorage.setItem("access_token", res.data.access);
    await AsyncStorage.setItem("refresh_token", res.data.refresh);
    await AsyncStorage.setItem("user", JSON.stringify(res.data.user));
    return res.data;
  },
  logout: async () => {
    await AsyncStorage.multiRemove(["access_token", "refresh_token", "user"]);
  },
  getUser: async () => {
    const u = await AsyncStorage.getItem("user");
    return u ? JSON.parse(u) : null;
  },
};

// Properties
export const propertyService = {
  list: () => api.get("/properties/").then(r => r.data.results || r.data),
  get: (id: number) => api.get(`/properties/${id}/`).then(r => r.data),
};

// Projects
export const projectService = {
  list: () => api.get("/projects/").then(r => r.data.results || r.data),
  get: (id: number) => api.get(`/projects/${id}/`).then(r => r.data),
};

// Customers
export const customerService = {
  list: () => api.get("/customers/").then(r => r.data.results || r.data),
};

// Transactions
export const transactionService = {
  list: () => api.get("/transactions/").then(r => r.data.results || r.data),
};

// Expenses
export const expenseService = {
  list: () => api.get("/expenses/").then(r => r.data.results || r.data),
};
