"use client";

import PageHeader from "../../../../components/PageHeader";
import {
    Palette,
    Upload,
    Save,
    Globe,
    Layout,
    Eye,
    RefreshCcw,
    Sparkles,
    Loader2
} from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

export default function AdminBrandingPage() {
    const { data: session } = useSession();
    const [siteName, setSiteName] = useState("Bizu! Portal");
    const [primaryColor, setPrimaryColor] = useState("#3b82f6");
    const [secondaryColor, setSecondaryColor] = useState("#1e40af");
    const [logoUrl, setLogoUrl] = useState("");
    const [faviconUrl, setFaviconUrl] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchBranding = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/v1/admin/branding/active`);
                if (res.ok) {
                    const data = await res.json();
                    setSiteName(data.siteName || "Bizu! Portal");
                    setPrimaryColor(data.primaryColor || "#3b82f6");
                    setSecondaryColor(data.secondaryColor || "#1e40af");
                    setLogoUrl(data.logoUrl || "");
                    setFaviconUrl(data.faviconUrl || "");
                }
            } catch (error) {
                console.error("Erro ao carregar branding", error);
                toast.error("Não foi possível carregar a marca atual");
            } finally {
                setLoading(false);
            }
        };
        fetchBranding();
    }, []);

    const handleSave = async () => {
        if (!session?.accessToken) {
            toast.error("Você precisa estar logado");
            return;
        }
        setSaving(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/v1/admin/branding`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session.accessToken}`
                },
                body: JSON.stringify({
                    siteName,
                    primaryColor,
                    secondaryColor,
                    logoUrl,
                    faviconUrl,
                    active: true
                })
            });
            if (res.ok) {
                toast.success("Branding atualizado com sucesso!");
                // Opcional: Atualizar janela para refletir nova cor no localStorage, caso implementado
            } else {
                toast.error("Falha ao atualizar marca");
            }
        } catch (error) {
            toast.error("Erro de conexão");
        } finally {
            setSaving(false);
        }
    };

    const resetToDefault = () => {
        setPrimaryColor("#3b82f6");
        setSecondaryColor("#1e40af");
        setSiteName("Bizu! Portal");
        toast.info("Cores restauradas para o padrão (não salvo ainda).", { icon: <RefreshCcw className="w-4 h-4" /> });
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                <PageHeader
                    title="Personalização (Branding)"
                    description="Altere a identidade visual do portal para promoções ou eventos especiais."
                    badge="DESIGN"
                />
                <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="h-12 rounded-xl font-bold px-8 gap-2 shadow-lg shadow-primary/20"
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {saving ? "Salvando..." : "Salvar Alterações"}
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="p-8 rounded-2xl bg-card border border-border space-y-6 shadow-sm">
                        <div className="flex items-center gap-3">
                            <Globe className="w-5 h-5 text-primary" />
                            <h3 className="text-xl font-bold">Informações Básicas</h3>
                        </div>

                        <div className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">Nome do Portal</label>
                                <input
                                    type="text"
                                    value={siteName}
                                    onChange={(e) => setSiteName(e.target.value)}
                                    placeholder="Ex: Bizu! Concursos"
                                    className="w-full h-11 px-4 rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-semibold"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">Cor Primária</label>
                                    <div className="flex gap-3">
                                        <input
                                            type="color"
                                            value={primaryColor}
                                            onChange={(e) => setPrimaryColor(e.target.value)}
                                            className="w-11 h-11 rounded-xl border-none cursor-pointer p-0 shrink-0"
                                        />
                                        <div className="flex-grow">
                                            <input
                                                type="text"
                                                value={primaryColor}
                                                onChange={(e) => setPrimaryColor(e.target.value)}
                                                className="w-full h-11 px-3 rounded-xl bg-background border border-border font-mono font-semibold text-center uppercase focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">Cor Secundária</label>
                                    <div className="flex gap-3">
                                        <input
                                            type="color"
                                            value={secondaryColor}
                                            onChange={(e) => setSecondaryColor(e.target.value)}
                                            className="w-11 h-11 rounded-xl border-none cursor-pointer p-0 shrink-0"
                                        />
                                        <div className="flex-grow">
                                            <input
                                                type="text"
                                                value={secondaryColor}
                                                onChange={(e) => setSecondaryColor(e.target.value)}
                                                className="w-full h-11 px-3 rounded-xl bg-background border border-border font-mono font-semibold text-center uppercase focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 rounded-2xl bg-card border border-border space-y-6 shadow-sm">
                        <div className="flex items-center gap-3">
                            <Upload className="w-5 h-5 text-primary" />
                            <h3 className="text-xl font-bold">Logotipo e Ícones</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="border border-dashed border-border rounded-2xl p-6 flex flex-col items-center justify-center space-y-3 text-center bg-muted/20">
                                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                                    <Palette className="w-5 h-5 text-muted-foreground" />
                                </div>
                                <div>
                                    <div className="font-semibold text-sm">Logotipo Principal</div>
                                    <p className="text-[10px] text-muted-foreground mt-0.5">PNG ou SVG Recomendado</p>
                                </div>
                                <Button variant="outline" size="sm" className="rounded-lg font-semibold h-8 text-xs mt-2" disabled>Em breve</Button>
                            </div>

                            <div className="border border-dashed border-border rounded-2xl p-6 flex flex-col items-center justify-center space-y-3 text-center bg-muted/20">
                                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                                    <Layout className="w-5 h-5 text-muted-foreground" />
                                </div>
                                <div>
                                    <div className="font-semibold text-sm">Favicon (Ícone)</div>
                                    <p className="text-[10px] text-muted-foreground mt-0.5">ICO ou PNG (32x32px)</p>
                                </div>
                                <Button variant="outline" size="sm" className="rounded-lg font-semibold h-8 text-xs mt-2" disabled>Em breve</Button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="p-6 rounded-2xl text-white shadow-xl relative overflow-hidden transition-colors duration-500" style={{ backgroundColor: primaryColor, boxShadow: `0 10px 25px -5px ${primaryColor}40` }}>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                        <Eye className="w-8 h-8 mb-3 opacity-60" />
                        <h3 className="text-lg font-bold mb-1.5 opacity-90">Preview de Botão</h3>
                        <p className="text-xs opacity-70 mb-5 font-medium leading-relaxed">Assim ficarão os botões principais do sistema com a nova cor selecionada.</p>
                        <div className="p-3.5 rounded-xl bg-white text-center font-bold text-sm transition-colors duration-500 shadow-sm" style={{ color: primaryColor }}>
                            Acessar Dashboard
                        </div>
                    </div>

                    <div className="p-6 rounded-2xl bg-card border border-border space-y-4 shadow-sm">
                        <div className="flex items-center gap-2 text-primary transition-colors duration-500" style={{ color: primaryColor }}>
                            <Sparkles className="w-4 h-4" />
                            <h4 className="font-bold text-xs uppercase tracking-wider">Modo Campanha</h4>
                        </div>
                        <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                            Dica: Durante a <strong>Black Friday</strong>, mude a cor primária para <span className="font-mono bg-muted px-1 py-0.5 rounded">#000000</span> e a secundária para <span className="font-mono bg-muted px-1 py-0.5 rounded">#FFD700</span> (Dourado) para criar um visual premium instantâneo!
                        </p>
                        <Button onClick={resetToDefault} variant="outline" className="w-full rounded-xl font-semibold text-sm h-10 mt-2">
                            Restaurar Padrão
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
