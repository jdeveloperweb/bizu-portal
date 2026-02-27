import Cookies from "js-cookie";
import { getStoredSelectedCourseId } from "@/lib/course-selection";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://bizu.mjoinix.com.br/api/v1";

export interface ApiErrorBody {
    status: number;
    code: string;
    message: string;
}

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
    const token = Cookies.get("token");
    const selectedCourseId = getStoredSelectedCourseId();

    let deviceFingerprint = "";
    if (typeof window !== "undefined") {
        deviceFingerprint = localStorage.getItem("device_fingerprint") || "";
        if (!deviceFingerprint && token) {
            // Se houver token mas não houver fingerprint, algo está errado ou é o primeiro acesso
            // O AuthProvider deve cuidar de gerar e registrar, mas como fallback:
            deviceFingerprint = crypto.randomUUID();
            localStorage.setItem("device_fingerprint", deviceFingerprint);
        }
    }

    const headers: Record<string, string> = {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(selectedCourseId ? { "X-Selected-Course-Id": selectedCourseId } : {}),
        ...(deviceFingerprint ? { "X-Device-Fingerprint": deviceFingerprint } : {}),
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

    // Handle errors
    if (response.status === 403) {
        try {
            const clone = response.clone();
            const body = await clone.json();

            // Handle device mismatch
            if (body.error === "DEVICE_MISMATCH") {
                if (typeof window !== "undefined") {
                    localStorage.removeItem("device_fingerprint");
                    Cookies.remove("token");
                    window.location.href = "/login?error=device_mismatch";
                }
            }

            // Handle entitlement denied — dispatch event for PaywallGate
            if (body.code === "ENTITLEMENT_DENIED" && typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("entitlement:denied", { detail: body }));
            }
        } catch {
            // response may not be JSON — ignore
        }
    }

    return response;
}
