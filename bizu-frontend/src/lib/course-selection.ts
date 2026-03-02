export const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function normalizeSelectedCourseId(value: unknown): string | undefined {
    if (typeof value !== "string") return undefined;

    const normalized = value.trim();
    if (!normalized || normalized.toLowerCase() === "undefined" || normalized.toLowerCase() === "null") {
        return undefined;
    }

    return UUID_REGEX.test(normalized) ? normalized : undefined;
}

export function getStoredSelectedCourseId(): string | undefined {
    if (typeof window === "undefined") return undefined;
    return normalizeSelectedCourseId(window.localStorage.getItem("selectedCourseId"));
}
