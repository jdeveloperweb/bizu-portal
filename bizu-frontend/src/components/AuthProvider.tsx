"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import keycloak from "@/lib/auth";
import Cookies from "js-cookie";

interface AuthContextType {
    authenticated: boolean;
    login: () => void;
    logout: () => void;
    token?: string;
    user?: any;
    loading: boolean;
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
    const logout = () => {
        Cookies.remove("token");
        keycloak?.logout({ redirectUri: window.location.origin });
    };

    return (
        <AuthContext.Provider value={{ authenticated, login, logout, token: keycloak?.token, user, loading }}>
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
