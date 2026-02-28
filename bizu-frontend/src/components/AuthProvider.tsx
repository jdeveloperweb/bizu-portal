"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import keycloak from "@/lib/auth";
import Cookies from "js-cookie";
import { normalizeSelectedCourseId } from "@/lib/course-selection";

interface AuthContextType {
    authenticated: boolean;
    login: () => void;
    loginDirect: (username: string, password: string) => Promise<boolean>;
    logout: () => void;
    token?: string;
    user: AuthUser | null;
    loading: boolean;
    register: (name: string, email: string, password: string, phone: string, emailCode: string, phoneCode: string) => Promise<boolean>;
    sendVerificationCode: (recipient: string, name: string, type: 'EMAIL' | 'WHATSAPP') => Promise<boolean>;
    selectedCourseId?: string;
    setSelectedCourseId: (courseId?: string) => void;
    refreshUserProfile: () => Promise<void>;
    subscription: any;
    entitlements: any[];
    isPremium: boolean;
    isFree: boolean;
    isAdmin: boolean;
}

interface AuthUser {
    id?: string;
    name?: string;
    email?: string;
    nickname?: string;
    avatarUrl?: string;
    phone?: string;
    preferred_username?: string;
    realm_access?: {
        roles: string[];
    };
    metadata?: Record<string, unknown>;
    [key: string]: any;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [authenticated, setAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<AuthUser | null>(null);
    const [subscription, setSubscription] = useState<any>(null);
    const [entitlements, setEntitlements] = useState<any[]>([]);
    const [selectedCourseId, setSelectedCourseIdState] = useState<string | undefined>(undefined);
    const [refreshing, setRefreshing] = useState(false);

    const applySelectedCourseId = (nextUser: AuthUser) => {
        const nextSelectedCourseId = normalizeSelectedCourseId(nextUser?.metadata?.selectedCourseId);
        setSelectedCourseIdState(nextSelectedCourseId);

        if (typeof window !== "undefined") {
            if (nextSelectedCourseId) {
                window.localStorage.setItem("selectedCourseId", nextSelectedCourseId);
            } else {
                window.localStorage.removeItem("selectedCourseId");
            }
        }
    };

    const registerDevice = useCallback(async () => {
        if (typeof window === "undefined") return;

        let fingerprint = localStorage.getItem("device_fingerprint");
        if (!fingerprint) {
            fingerprint = crypto.randomUUID();
            localStorage.setItem("device_fingerprint", fingerprint);
        }

        const userAgent = window.navigator.userAgent;
        let os = "Unknown OS";
        if (userAgent.indexOf("Win") !== -1) os = "Windows";
        if (userAgent.indexOf("Mac") !== -1) os = "MacOS";
        if (userAgent.indexOf("X11") !== -1) os = "UNIX";
        if (userAgent.indexOf("Linux") !== -1) os = "Linux";
        if (userAgent.indexOf("Android") !== -1) os = "Android";
        if (userAgent.indexOf("like Mac") !== -1) os = "iOS";

        let browser = "Unknown Browser";
        if (userAgent.indexOf("Chrome") !== -1) browser = "Chrome";
        else if (userAgent.indexOf("Safari") !== -1) browser = "Safari";
        else if (userAgent.indexOf("Firefox") !== -1) browser = "Firefox";
        else if (userAgent.indexOf("MSIE") !== -1 || !!(document as any).documentMode) browser = "IE";

        try {
            const { apiFetch } = await import("@/lib/api");
            await apiFetch("/devices/register", {
                method: "POST",
                body: JSON.stringify({
                    fingerprint,
                    os,
                    browser
                })
            });
        } catch (err) {
            console.error("Failed to register device", err);
        }
    }, []);

    const refreshToken = useCallback(async () => {
        if (typeof window === "undefined" || refreshing) return false;

        // Tenta renovar via keycloak-js se ele estiver autenticado
        if (keycloak && keycloak.token && keycloak.authenticated) {
            try {
                // Tenta renovar se o token expira em menos de 70 segundos
                const refreshed = await keycloak.updateToken(70);
                if (refreshed) {
                    console.log("Token renovado via Keycloak JS");
                    Cookies.set("token", keycloak.token || "", { expires: 1 });
                    return true;
                }
                // Se retornou false, o token ainda é válido (mais de 70s)
                return true;
            } catch (err) {
                console.warn("Falha ao renovar token via Keycloak JS, tentando manual...");
            }
        }

        // Fallback manual usando refresh_token (necessário para loginDirect)
        const rToken = Cookies.get("refresh_token");
        if (!rToken) return false;

        setRefreshing(true);
        const params = new URLSearchParams();
        params.append("client_id", process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || "bizu-portal-app");
        params.append("grant_type", "refresh_token");
        params.append("refresh_token", rToken);

        const authServerUrl = process.env.NEXT_PUBLIC_KEYCLOAK_URL || "https://bizu.mjoinix.com.br/auth";
        const realm = process.env.NEXT_PUBLIC_KEYCLOAK_REALM || "bizu-portal";

        try {
            const res = await fetch(`${authServerUrl}/realms/${realm}/protocol/openid-connect/token`, {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: params,
            });

            if (res.ok) {
                const data = await res.json();
                Cookies.set("token", data.access_token, { expires: 1 });
                if (data.refresh_token) {
                    Cookies.set("refresh_token", data.refresh_token, { expires: 1 });
                }
                setRefreshing(false);
                return true;
            } else {
                console.warn("Refresh token expirado ou inválido.");
                setRefreshing(false);
                return false;
            }
        } catch (error) {
            console.error("Erro na renovação manual do token", error);
            setRefreshing(false);
            return false;
        }
    }, [refreshing]);

    const refreshUserProfile = useCallback(async () => {
        const token = Cookies.get("token");
        if (!token) return;

        // Register device first to ensure backend has it before we make other calls
        await registerDevice();

        const apiBase = process.env.NEXT_PUBLIC_API_URL || "";
        const endpoint = apiBase.endsWith('/api/v1')
            ? `${apiBase}/users/me`
            : `${apiBase}/api/v1/users/me`;

        const res = await fetch(endpoint, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        if (res.ok) {
            const me = await res.json();
            setUser(me);
            applySelectedCourseId(me);

            // Fetch subscription and entitlements
            try {
                const subRes = await fetch(apiBase.endsWith('/api/v1') ? `${apiBase}/subscriptions/me` : `${apiBase}/api/v1/subscriptions/me`, {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (subRes.ok) {
                    const subData = await subRes.json();
                    setSubscription(subData);
                } else {
                    setSubscription(null);
                }

                const entRes = await fetch(apiBase.endsWith('/api/v1') ? `${apiBase}/student/entitlements/me` : `${apiBase}/api/v1/student/entitlements/me`, {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (entRes.ok) {
                    const entData = await entRes.json();
                    setEntitlements(entData);
                }
            } catch (err) {
                console.error("Failed to fetch subscription or entitlements in AuthProvider", err);
                setSubscription(null);
            }
        }
    }, []);

    useEffect(() => {
        if (!keycloak) return;

        keycloak
            .init({
                onLoad: "check-sso",
                silentCheckSsoRedirectUri: typeof window !== "undefined" ? window.location.origin + "/silent-check-sso.html" : undefined,
                pkceMethod: "S256",
            })
            .then(async (auth) => {
                if (auth && keycloak) {
                    setAuthenticated(true);
                    Cookies.set("token", keycloak.token || "", { expires: 1 });
                    setUser(keycloak.tokenParsed ?? null);
                    await refreshUserProfile();
                } else {
                    const manualToken = Cookies.get("token");
                    if (manualToken) {
                        try {
                            const base64Url = manualToken.split('.')[1];
                            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                            const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
                            const parsedToken = JSON.parse(jsonPayload);

                            // Check expiration
                            if (parsedToken.exp && parsedToken.exp * 1000 > Date.now()) {
                                setAuthenticated(true);
                                setUser(parsedToken);
                                await refreshUserProfile();
                            } else {
                                Cookies.remove("token");
                                setAuthenticated(false);
                            }
                        } catch (e) {
                            console.error("Failed to parse manual token", e);
                            Cookies.remove("token");
                            setAuthenticated(false);
                        }
                    } else {
                        setAuthenticated(false);
                    }
                }
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
            });
    }, [refreshUserProfile]);

    // Intervalo para verificar e renovar token a cada 1 minuto se autenticado
    // E heartbeat de presença a cada 10 segundos
    useEffect(() => {
        if (!authenticated) return;

        const tokenInterval = setInterval(() => {
            refreshToken();
        }, 60000);

        const presenceInterval = setInterval(async () => {
            try {
                const { apiFetch } = await import("@/lib/api");
                await apiFetch("/duelos/heartbeat", { method: "POST" });
            } catch (err) {
                // Silently ignore heartbeat errors
            }
        }, 10000);

        return () => {
            clearInterval(tokenInterval);
            clearInterval(presenceInterval);
        };
    }, [authenticated, refreshToken]);

    const login = () => keycloak?.login();

    const loginDirect = async (username: string, password: string) => {
        const params = new URLSearchParams();
        params.append("client_id", "bizu-portal-app");
        params.append("grant_type", "password");
        params.append("username", username);
        params.append("password", password);
        params.append("scope", "openid");

        try {
            if (!keycloak || !keycloak.authServerUrl || !keycloak.realm) {
                console.error("Keycloak is not initialized or missing authServerUrl/realm.");
                return false;
            }

            const res = await fetch(`${keycloak.authServerUrl}/realms/${keycloak.realm}/protocol/openid-connect/token`, {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: params,
            });

            if (res.ok) {
                const data = await res.json();
                Cookies.set("token", data.access_token, { expires: 1 });
                if (data.refresh_token) {
                    Cookies.set("refresh_token", data.refresh_token, { expires: 1 });
                }

                try {
                    const base64Url = data.access_token.split('.')[1];
                    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
                    setUser(JSON.parse(jsonPayload));
                } catch (e) {
                    console.error("Erro ao decodificar token", e);
                }

                setAuthenticated(true);
                await refreshUserProfile();
                return true;
            } else if (res.status === 401 || res.status === 400) {
                console.warn("Invalid credentials");
                return false;
            } else {
                console.error(`Login failed with status: ${res.status}`);
                return false;
            }
        } catch (error) {
            console.error("Login request failed", error);
            return false;
        }
    };

    const setSelectedCourseId = (courseId?: string) => {
        const normalizedCourseId = normalizeSelectedCourseId(courseId);
        setSelectedCourseIdState(normalizedCourseId);
        if (typeof window !== "undefined") {
            if (normalizedCourseId) {
                window.localStorage.setItem("selectedCourseId", normalizedCourseId);
            } else {
                window.localStorage.removeItem("selectedCourseId");
            }
        }
    };

    const logout = () => {
        Cookies.remove("token");
        Cookies.remove("refresh_token");
        if (typeof window !== "undefined") {
            window.localStorage.removeItem("selectedCourseId");
            window.localStorage.removeItem("device_fingerprint");
        }
        keycloak?.logout({ redirectUri: window.location.origin });
    };

    const sendVerificationCode = async (recipient: string, name: string, type: 'EMAIL' | 'WHATSAPP') => {
        try {
            const apiBase = process.env.NEXT_PUBLIC_API_URL || "";
            const endpoint = apiBase.endsWith('/api/v1')
                ? `${apiBase}/public/auth/send-verification-code`
                : `${apiBase}/api/v1/public/auth/send-verification-code`;

            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ recipient, name, type }),
            });
            return res.ok;
        } catch (error) {
            console.error("Failed to send verification code", error);
            return false;
        }
    };

    const register = async (name: string, email: string, password: string, phone: string, emailCode: string, phoneCode: string) => {
        try {
            const apiBase = process.env.NEXT_PUBLIC_API_URL || "";
            const endpoint = apiBase.endsWith('/api/v1')
                ? `${apiBase}/public/auth/register`
                : `${apiBase}/api/v1/public/auth/register`;

            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password, phone, emailCode, phoneCode }),
            });
            return res.ok;
        } catch (error) {
            console.error("Registration failed", error);
            return false;
        }
    };

    const isPremium = !!subscription &&
        (subscription.status === "ACTIVE" || subscription.status === "PAST_DUE") &&
        !subscription.plan?.free;
    const isFree = authenticated && !isPremium;
    const isAdmin = authenticated && (
        user?.roles?.some((r: any) => r.name === 'ADMIN') ||
        user?.realm_access?.roles?.includes('ADMIN') ||
        user?.role === 'ADMIN'
    );

    return (
        <AuthContext.Provider value={{ authenticated, login, loginDirect, logout, token: keycloak?.token, user, loading, register, sendVerificationCode, selectedCourseId, setSelectedCourseId, refreshUserProfile, subscription, entitlements, isPremium, isFree, isAdmin }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
