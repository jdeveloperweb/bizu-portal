const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://bizu.mjolnix.com.br/api/v1";

export type MediaSourceType = "uploaded" | "external";

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

export function getMediaSourceType(path?: string | null): MediaSourceType {
    if (!path) return "uploaded";

    const trimmedPath = path.trim();
    if (!trimmedPath) return "uploaded";

    if (/^data:|^blob:/i.test(trimmedPath)) {
        return "uploaded";
    }

    if (/^(https?:)?\/\//i.test(trimmedPath)) {
        const apiOrigin = getApiOrigin();

        try {
            const mediaUrl = new URL(trimmedPath, apiOrigin || undefined);
            if (!apiOrigin) return "external";

            return mediaUrl.origin === apiOrigin ? "uploaded" : "external";
        } catch {
            return "external";
        }
    }

    return "uploaded";
}
