const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://bizu.mjolnix.com.br/api/v1";

function getApiOrigin() {
    try {
        return new URL(API_URL).origin;
    } catch {
        return "";
    }
}

export function resolveMediaUrl(path?: string | null) {
    if (!path) return undefined;

    const trimmedPath = path.trim();
    if (!trimmedPath) return undefined;

    if (/^(https?:)?\/\//i.test(trimmedPath) || /^data:|^blob:/i.test(trimmedPath)) {
        return trimmedPath;
    }

    const normalizedPath = trimmedPath.startsWith("/") ? trimmedPath : `/${trimmedPath}`;
    const apiOrigin = getApiOrigin();

    return apiOrigin ? `${apiOrigin}${normalizedPath}` : normalizedPath;
}

