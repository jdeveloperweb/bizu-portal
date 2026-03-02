import Cookies from "js-cookie";
import { getStoredSelectedCourseId } from "@/lib/course-selection";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://bizu.mjolnix.com.br/api/v1";

export interface ApiErrorBody {
    status: number;
    code: string;
    message: string;
}

export function getOrCreateFingerprint(): string {
    if (typeof window === "undefined") return "";

    let fingerprint = localStorage.getItem("device_fingerprint") || "";
    if (fingerprint === "null" || fingerprint === "undefined") fingerprint = "";

    const isLegacyUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(fingerprint);

    if (!fingerprint || isLegacyUUID) {
        const screenRes = `${window.screen.width}x${window.screen.height}`;
        const platform = (navigator as any).userAgentData?.platform ?? "unknown";
        const timezone = Intl ? new Intl.DateTimeFormat().resolvedOptions().timeZone : "unknown";
        const hardwareConcurrency = window.navigator.hardwareConcurrency || "unknown";
        const rawFingerprint = `${screenRes}|${platform}|${timezone}|${hardwareConcurrency}`;
        const salt = crypto.randomUUID().substring(0, 8);
        fingerprint = `hw_${btoa(rawFingerprint).substring(0, 32)}_${salt}`;
        localStorage.setItem("device_fingerprint", fingerprint);
    }

    return fingerprint;
}

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
    const token = Cookies.get("token");
    const selectedCourseId = getStoredSelectedCourseId();
    const isPublicEndpoint = (endpoint.includes("/public/") && !endpoint.includes("/courses")) || endpoint.includes("/branding/active");

    const deviceFingerprint = getOrCreateFingerprint();

    const headers: Record<string, string> = {
        ...(token && !isPublicEndpoint ? { Authorization: `Bearer ${token}` } : {}),
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
            // Handle device mismatch — AuthProvider should handle this now.
            // Automatic redirect was causing infinite loops.
            if (body.error === "DEVICE_MISMATCH") {
                console.warn("Device mismatch detected by apiFetch. Letting AuthProvider handle it.");
                // dispatch a global event or something if needed, but avoid direct window.location here
                // unless we are sure it won't loop.
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
