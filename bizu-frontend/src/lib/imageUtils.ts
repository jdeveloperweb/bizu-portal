/**
 * Compress an image file using Canvas API
 * @param file The original image file
 * @param maxWidth Maximum width in pixels
 * @param maxHeight Maximum height in pixels
 * @param quality Quality from 0 to 1
 * @returns A promise that resolves to the compressed Blob
 */
export async function compressImage(
    file: File,
    maxWidth: number = 800,
    maxHeight: number = 800,
    quality: number = 0.8
): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Calculate aspect ratio and new dimensions
                if (width > height) {
                    if (width > maxWidth) {
                        height *= maxWidth / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width *= maxHeight / height;
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error("Could not get canvas context"));
                    return;
                }

                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            resolve(blob);
                        } else {
                            reject(new Error("Canvas toBlob failed"));
                        }
                    },
                    'image/jpeg',
                    quality
                );
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
}

/**
 * Get the full URL for an avatar, handling potential duplication of /api/v1
 * @param url The avatar URL from the database
 * @returns The final full URL
 */
export function getAvatarUrl(url?: string): string {
    if (!url) return '';
    if (url.startsWith('http')) return url;

    let apiBase = process.env.NEXT_PUBLIC_API_URL || '';
    // Ensure apiBase doesn't end with a slash for easier joining
    if (apiBase.endsWith('/')) {
        apiBase = apiBase.substring(0, apiBase.length - 1);
    }

    // Ensure url starts with a slash
    let cleanUrl = url;
    if (!cleanUrl.startsWith('/')) {
        cleanUrl = '/' + cleanUrl;
    }

    const prefix = '/api/v1';

    // If apiBase ends with /api/v1 AND url also starts with /api/v1, remove one
    if (apiBase.endsWith(prefix) && cleanUrl.startsWith(prefix)) {
        return `${apiBase.substring(0, apiBase.length - prefix.length)}${cleanUrl}`;
    }

    return `${apiBase}${cleanUrl}`;
}
