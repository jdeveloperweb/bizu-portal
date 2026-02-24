import Keycloak from "keycloak-js";

const keycloakConfig = {
    url: process.env.NEXT_PUBLIC_KEYCLOAK_URL || "https://bizu.mjolnix.com.br/auth",
    realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM || "bizu-portal",
    clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || "bizu-portal-app",
};

const keycloak = typeof window !== "undefined" ? new Keycloak(keycloakConfig) : null;

export default keycloak;
