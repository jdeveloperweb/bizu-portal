"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import keycloak from "@/lib/auth";
import Cookies from "js-cookie";

interface AuthContextType {
    authenticated: boolean;
    login: () => void;
    loginDirect: (username: string, password: string) => Promise<boolean>;
    logout: () => void;
    token?: string;
    user?: any;
    loading: boolean;
    register: (name: string, email: string, password: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [authenticated, setAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        if (!keycloak) return;

        keycloak
            .init({
                onLoad: "check-sso",
                silentCheckSsoRedirectUri: typeof window !== "undefined" ? window.location.origin + "/silent-check-sso.html" : undefined,
                pkceMethod: "S256",
            })
            .then((auth) => {
                setAuthenticated(auth);
                if (auth && keycloak) {
                    Cookies.set("token", keycloak.token || "", { expires: 1 });
                    setUser(keycloak.tokenParsed);
                }
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
            });
    }, []);

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

                // Decodifica o token manualmente para atualizar o estado do usuário imediatamente
                try {
                    const base64Url = data.access_token.split('.')[1];
                    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
                    setUser(JSON.parse(jsonPayload));
                } catch (e) {
                    console.error("Erro ao decodificar token", e);
                }

                setAuthenticated(true);
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

    const logout = () => {
        Cookies.remove("token");
        keycloak?.logout({ redirectUri: window.location.origin });
    };

    const register = async (name: string, email: string, password: string) => {
        try {
            const apiBase = process.env.NEXT_PUBLIC_API_URL || "";
            // Se apiBase já termina com /api/v1, não adicionamos novamente
            const endpoint = apiBase.endsWith('/api/v1')
                ? `${apiBase}/public/auth/register`
                : `${apiBase}/api/v1/public/auth/register`;

            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            });
            return res.ok;
        } catch (error) {
            console.error("Registration failed", error);
            return false;
        }
    };

    return (
        <AuthContext.Provider value={{ authenticated, login, loginDirect, logout, token: keycloak?.token, user, loading, register }}>
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
