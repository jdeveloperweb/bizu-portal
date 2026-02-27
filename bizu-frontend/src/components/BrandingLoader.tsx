"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { hexToHsl } from "@/lib/utils";

export default function BrandingLoader() {
    const pathname = usePathname();

    useEffect(() => {
        const fetchAndApplyBranding = async () => {
            try {
                // 1. Fetch Global Branding - Uso de fetch direto para evitar envio de tokens expirados que causam 401
                const apiBase = process.env.NEXT_PUBLIC_API_URL || "https://bizu.mjoinix.com.br/api/v1";
                const res = await fetch(`${apiBase}/admin/branding/active`);
                if (res.ok) {
                    const branding = await res.json();

                    if (branding.primaryColor) {
                        document.documentElement.style.setProperty('--primary', hexToHsl(branding.primaryColor));
                    }

                    if (branding.secondaryColor) {
                        document.documentElement.style.setProperty('--secondary', hexToHsl(branding.secondaryColor));
                    }

                    if (branding.siteName) {
                        // Opcional: Atualizar título da página se necessário
                        // document.title = `${branding.siteName} — Portal`;
                    }

                    if (branding.fontFamily && branding.fontFamily !== "Plus Jakarta Sans") {
                        const font = branding.fontFamily;
                        document.documentElement.style.setProperty('--font-sans', `"${font}", "Plus Jakarta Sans", system-ui, sans-serif`);

                        const linkId = "global-font";
                        let link = document.getElementById(linkId) as HTMLLinkElement;
                        if (!link) {
                            link = document.createElement("link");
                            link.id = linkId;
                            link.rel = "stylesheet";
                            document.head.appendChild(link);
                        }
                        link.href = `https://fonts.googleapis.com/css2?family=${font.replace(/ /g, '+')}:wght@400;500;600;700;800&display=swap`;
                    } else if (branding.fontFamily === "Plus Jakarta Sans") {
                        document.documentElement.style.setProperty('--font-sans', `"Plus Jakarta Sans", system-ui, sans-serif`);
                        const link = document.getElementById("global-font");
                        if (link) link.remove();
                    }
                }

                // 2. Lógica Dinâmica para Curso (Sobrescreve se necessário)
                if (pathname?.startsWith('/cursos/')) {
                    const courseId = pathname.split('/')[2];
                    // Aqui poderíamos buscar a cor específica do curso se a API suportar
                    // Por enquanto mantemos a simulação ou removemos se o branding global for soberano
                }
            } catch (error) {
                console.error("Erro ao carregar branding dinâmico", error);
            }
        };

        fetchAndApplyBranding();
    }, [pathname]);

    return null;
}
