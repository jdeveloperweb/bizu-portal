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
                // 1. Fetch Global Branding
                const res = await apiFetch(`/admin/branding/active`);
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
