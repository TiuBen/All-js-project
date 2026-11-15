import api from "./api";


export const AuthService = {
    login: (username, password) => api.post("/auth/login", { username, password }),

    logout: () => api.post("/auth/logout", { requiresAuth: true }),

    checkToken: () => api.get("/auth/check", { requiresAuth: true }),
};
