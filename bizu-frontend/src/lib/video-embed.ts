const YOUTUBE_HOSTS = new Set([
    "youtube.com",
    "www.youtube.com",
    "m.youtube.com",
    "youtu.be",
]);

const VIMEO_HOSTS = new Set([
    "vimeo.com",
    "www.vimeo.com",
    "player.vimeo.com",
]);

const getYoutubeEmbedUrl = (url: URL): string | null => {
    if (url.hostname === "youtu.be") {
        const id = url.pathname.split("/").filter(Boolean)[0];
        return id ? `https://www.youtube.com/embed/${id}` : null;
    }

    if (!YOUTUBE_HOSTS.has(url.hostname)) {
        return null;
    }

    const watchVideoId = url.searchParams.get("v");
    if (watchVideoId) {
        return `https://www.youtube.com/embed/${watchVideoId}`;
    }

    const pathSegments = url.pathname.split("/").filter(Boolean);
    const pathPrefix = pathSegments[0];
    const pathVideoId = pathSegments[1];

    if (pathPrefix && pathVideoId && ["embed", "shorts", "live"].includes(pathPrefix)) {
        return `https://www.youtube.com/embed/${pathVideoId}`;
    }

    return null;
};

const getVimeoEmbedUrl = (url: URL): string | null => {
    if (!VIMEO_HOSTS.has(url.hostname)) {
        return null;
    }

    if (url.hostname === "player.vimeo.com") {
        return url.href;
    }

    const match = url.pathname.match(/\/(?:video\/)?(\d+)/);
    if (!match?.[1]) {
        return null;
    }

    return `https://player.vimeo.com/video/${match[1]}`;
};

export const getVideoEmbedUrl = (rawUrl?: string | null): string | null => {
    if (!rawUrl?.trim()) {
        return null;
    }

    try {
        const url = new URL(rawUrl.trim());
        return getYoutubeEmbedUrl(url) || getVimeoEmbedUrl(url);
    } catch {
        return null;
    }
};

