const BASE_URL = import.meta.env.VITE_SERVER_URL || "https://yourserver.com/api";

export async function request(url, options = {}, requiresAuth = false) {
    const headers = {
        "Content-Type": "application/json",
        ...options.headers,
    };

    if (requiresAuth) {
        const token = localStorage.getItem("token");
        if (token) headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(BASE_URL + url, {
        ...options,
        headers,
    });

    if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
    return res.json();
}
