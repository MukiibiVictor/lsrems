import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Your PC's local WiFi IP — update if it changes
const API_BASE = "http://192.168.1.5:8000/api";

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
});

// Attach token to every request
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("auth_token");
  if (token) config.headers.Authorization = `Token ${token}`;
  return config;
});

// Auth — backend uses DRF Token auth (not JWT)
export const authService = {
  login: async (email: string, password: string) => {
    const res = await api.post("/auth/login/", { email, password });
    // Backend returns { token, user }
    await AsyncStorage.setItem("auth_token", res.data.token);
    await AsyncStorage.setItem("user", JSON.stringify(res.data.user));
    return res.data;
  },
  logout: async () => {
    await AsyncStorage.multiRemove(["auth_token", "user"]);
  },
  getUser: async () => {
    const u = await AsyncStorage.getItem("user");
    return u ? JSON.parse(u) : null;
  },
};

// Customers
export const customerService = {
  list: () => api.get("/customers/").then(r => r.data.results || r.data),
  create: (data: any) => api.post("/customers/", data).then(r => r.data),
  update: (id: number, data: any) => api.patch(`/customers/${id}/`, data).then(r => r.data),
  remove: (id: number) => api.delete(`/customers/${id}/`),
};

// Transactions
export const transactionService = {
  list: () => api.get("/transactions/").then(r => r.data.results || r.data),
  create: (data: any) => api.post("/transactions/", data).then(r => r.data),
  update: (id: number, data: any) => api.patch(`/transactions/${id}/`, data).then(r => r.data),
  remove: (id: number) => api.delete(`/transactions/${id}/`),
};

// Expenses
export const expenseService = {
  list: () => api.get("/expenses/").then(r => r.data.results || r.data),
  create: (data: any) => api.post("/expenses/", data).then(r => r.data),
  update: (id: number, data: any) => api.patch(`/expenses/${id}/`, data).then(r => r.data),
  remove: (id: number) => api.delete(`/expenses/${id}/`),
};

// Properties
export const propertyService = {
  list: () => api.get("/properties/").then(r => r.data.results || r.data),
  get: (id: number) => api.get(`/properties/${id}/`).then(r => r.data),
  create: (data: any) => api.post("/properties/", data).then(r => r.data),
  update: (id: number, data: any) => api.patch(`/properties/${id}/`, data).then(r => r.data),
  remove: (id: number) => api.delete(`/properties/${id}/`),
};

// Projects
export const projectService = {
  list: () => api.get("/projects/").then(r => r.data.results || r.data),
  unassigned: () => api.get("/projects/unassigned/").then(r => r.data.results || r.data),
  myJobs: () => api.get("/projects/my-jobs/").then(r => r.data.results || r.data),
  get: (id: number) => api.get(`/projects/${id}/`).then(r => r.data),
  create: (data: any) => api.post("/projects/", data).then(r => r.data),
  update: (id: number, data: any) => api.patch(`/projects/${id}/`, data).then(r => r.data),
  remove: (id: number) => api.delete(`/projects/${id}/`),
  assignSelf: (id: number) => api.post(`/projects/${id}/assign-self/`).then(r => r.data),
  assign: (id: number, userId: number) => api.post(`/projects/${id}/assign/`, { user_id: userId }).then(r => r.data),
  complete: (id: number, notes?: string) => api.post(`/projects/${id}/complete/`, { notes }).then(r => r.data),
};

// Notifications
export const notificationService = {
  list: () => api.get("/notifications/?page_size=50").then(r => r.data.results || r.data),
  unreadCount: () => api.get("/notifications/unread-count/").then(r => r.data.count as number),
  markRead: (id: number) => api.post(`/notifications/${id}/mark-read/`),
  markAllRead: () => api.post("/notifications/mark-all-read/"),
};
