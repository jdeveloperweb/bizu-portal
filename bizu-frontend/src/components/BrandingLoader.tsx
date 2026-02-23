"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function BrandingLoader() {
    const pathname = usePathname();

    useEffect(() => {
        // 1. Fetch Global Branding (Simulado)
        const branding = {
            primaryColor: "#3b82f6",
            secondaryColor: "#1e40af",
            siteName: "Bizu! Portal"
        };

        // Aplicar variáveis globais
        document.documentElement.style.setProperty('--primary', hexToHsl(branding.primaryColor));
        document.documentElement.style.setProperty('--primary-foreground', '0 0% 100%');

        // 2. Lógica Dinâmica para Curso
        // Se estivermos em /cursos/[id], poderíamos pegar a cor do curso
        if (pathname?.startsWith('/cursos/')) {
            // Simulação: ID 1 é roxo, ID 2 é verde
            const courseId = pathname.split('/')[2];
            let courseColor = "";

            if (courseId === "1") courseColor = "#8b5cf6"; // Violeta
            if (courseId === "2") courseColor = "#10b981"; // Esmeralda

            if (courseColor) {
                document.documentElement.style.setProperty('--primary', hexToHsl(courseColor));
            }
        }

    }, [pathname]);

    return null;
}

// Helper para converter Hex para HSL (formato esperado pelo Shadcn/Tailwind)
function hexToHsl(hex: string): string {
    let r = parseInt(hex.slice(1, 3), 16) / 255;
    let g = parseInt(hex.slice(3, 5), 16) / 255;
    let b = parseInt(hex.slice(5, 7), 16) / 255;

    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0;
    } else {
        let d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}
