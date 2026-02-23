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
    Sparkles
} from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { useState } from "react";

export default function AdminBrandingPage() {
    const [siteName, setSiteName] = useState("Bizu! Portal");
    const [primaryColor, setPrimaryColor] = useState("#3b82f6");
    const [secondaryColor, setSecondaryColor] = useState("#1e40af");
    const [logoUrl, setLogoUrl] = useState("");

    return (
        <div className="container mx-auto px-4 py-12 max-w-5xl">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <PageHeader
                    title="Personalização (Branding)"
                    description="Altere a identidade visual do portal para promoções ou eventos especiais."
                    badge="DESIGN"
                />
                <Button className="h-14 rounded-2xl font-black px-12 gap-2 shadow-xl shadow-primary/20">
                    <Save className="w-5 h-5" />
                    Salvar Alterações
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-8">
                    <div className="p-10 rounded-[48px] bg-card border space-y-8">
                        <div className="flex items-center gap-3">
                            <Globe className="w-6 h-6 text-primary" />
                            <h3 className="text-2xl font-black">Informações Básicas</h3>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Nome do Portal</label>
                                <input
                                    type="text"
                                    value={siteName}
                                    onChange={(e) => setSiteName(e.target.value)}
                                    placeholder="Ex: Bizu! Concursos"
                                    className="w-full h-14 px-6 rounded-2xl bg-muted/50 border focus:border-primary outline-none transition-all font-bold"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Cor Primária</label>
                                    <div className="flex gap-4">
                                        <input
                                            type="color"
                                            value={primaryColor}
                                            onChange={(e) => setPrimaryColor(e.target.value)}
                                            className="w-16 h-16 rounded-2xl border-none cursor-pointer p-0"
                                        />
                                        <div className="flex-grow">
                                            <input
                                                type="text"
                                                value={primaryColor}
                                                onChange={(e) => setPrimaryColor(e.target.value)}
                                                className="w-full h-16 px-4 rounded-2xl bg-muted/50 border font-mono font-bold text-center"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Cor Secundária</label>
                                    <div className="flex gap-4">
                                        <input
                                            type="color"
                                            value={secondaryColor}
                                            onChange={(e) => setSecondaryColor(e.target.value)}
                                            className="w-16 h-16 rounded-2xl border-none cursor-pointer p-0"
                                        />
                                        <div className="flex-grow">
                                            <input
                                                type="text"
                                                value={secondaryColor}
                                                onChange={(e) => setSecondaryColor(e.target.value)}
                                                className="w-full h-16 px-4 rounded-2xl bg-muted/50 border font-mono font-bold text-center"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-10 rounded-[48px] bg-card border space-y-8">
                        <div className="flex items-center gap-3">
                            <Upload className="w-6 h-6 text-primary" />
                            <h3 className="text-2xl font-black">Logotipo e Ícones</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="border-2 border-dashed rounded-[32px] p-8 flex flex-col items-center justify-center space-y-4 text-center">
                                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                                    <RefreshCcw className="w-8 h-8 text-muted-foreground" />
                                </div>
                                <div>
                                    <div className="font-bold">Logotipo Principal</div>
                                    <p className="text-xs text-muted-foreground">PNG ou SVG (Recomendado: 200x50px)</p>
                                </div>
                                <Button variant="outline" className="rounded-xl font-bold">Upload</Button>
                            </div>

                            <div className="border-2 border-dashed rounded-[32px] p-8 flex flex-col items-center justify-center space-y-4 text-center">
                                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                                    <RefreshCcw className="w-8 h-8 text-muted-foreground" />
                                </div>
                                <div>
                                    <div className="font-bold">Favicon (Ícone)</div>
                                    <p className="text-xs text-muted-foreground">ICO ou PNG (32x32px)</p>
                                </div>
                                <Button variant="outline" className="rounded-xl font-bold">Upload</Button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="p-8 rounded-[48px] bg-primary text-primary-foreground shadow-2xl shadow-primary/20 relative overflow-hidden" style={{ backgroundColor: primaryColor }}>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                        <Eye className="w-10 h-10 mb-4 opacity-50" />
                        <h3 className="text-xl font-black mb-2">Preview de Botão</h3>
                        <p className="text-sm opacity-80 mb-6 font-medium">Assim ficarão os elementos principais do sistema com a nova cor.</p>
                        <div className="p-4 rounded-2xl bg-white text-primary font-black text-center" style={{ color: primaryColor }}>
                            Botão de Ação
                        </div>
                    </div>

                    <div className="p-8 rounded-[48px] bg-card border space-y-6">
                        <div className="flex items-center gap-3 text-primary" style={{ color: primaryColor }}>
                            <Sparkles className="w-5 h-5" />
                            <h4 className="font-black text-sm uppercase tracking-widest">Modo Campanha</h4>
                        </div>
                        <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                            Dica: Durante a **Black Friday**, mude a cor primária para #000000 e a secundária para #FFD700 (Dourado) para criar um visual premium instantâneo!
                        </p>
                        <Button variant="outline" className="w-full rounded-xl font-bold">Resetar para o Padrão</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
