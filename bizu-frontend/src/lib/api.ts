import Cookies from "js-cookie";
import { getStoredSelectedCourseId } from "@/lib/course-selection";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://bizu.mjolnix.com.br/api/v1";

export interface ApiErrorBody {
    status: number;
    code: string;
    message: string;
}

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
    const token = Cookies.get("token");

    const selectedCourseId = getStoredSelectedCourseId();

    const headers: Record<string, string> = {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(selectedCourseId ? { "X-Selected-Course-Id": selectedCourseId } : {}),
        ...Object.fromEntries(Object.entries(options.headers || {}).map(([k, v]) => [k, String(v)])),
    };

    if (!(options.body instanceof FormData)) {
        headers["Content-Type"] = "application/json";
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (response.status === 401) {
        if (typeof window !== "undefined") {
            const path = window.location.pathname.toLowerCase();
            const isAuthPage = path === "/login" || path === "/register" || path.startsWith("/forgot-password");
            const isPublicEndpoint = endpoint.includes("/public/") || endpoint.includes("/branding/active");

            if (!isAuthPage && !isPublicEndpoint) {
                window.location.href = "/login";
            }
        }
    }

    // Handle entitlement denied — dispatch event for PaywallGate
    if (response.status === 403) {
        try {
            const clone = response.clone();
            const body: ApiErrorBody = await clone.json();
            if (body.code === "ENTITLEMENT_DENIED" && typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("entitlement:denied", { detail: body }));
            }
        } catch {
            // response may not be JSON — ignore
        }
    }

    return response;
}
