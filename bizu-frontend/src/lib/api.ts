import Cookies from "js-cookie";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://bizu.mjolnix.com.br/api/v1";

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
    const token = Cookies.get("token");

    const selectedCourseId = typeof window !== "undefined" ? window.localStorage.getItem("selectedCourseId") : null;

    const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(selectedCourseId ? { "X-Selected-Course-Id": selectedCourseId } : {}),
        ...options.headers,
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (response.status === 401) {
        // Se o token expirou, podemos redirecionar para o login
        if (typeof window !== "undefined") {
            window.location.href = "/login";
        }
    }

    return response;
}
