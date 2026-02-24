"use client";

import PageHeader from "../../../../components/PageHeader";
import {
    Save,
    CreditCard,
    Mail,
    Video,
    Server,
    Loader2
} from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";

export default function AdminConfiguracoesPage() {
    const [activeTab, setActiveTab] = useState("pagamento");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Initial State
    const [settings, setSettings] = useState({
        stripePubKey: "",
        stripeSecretKey: "",
        stripeWebhookSecret: "",
        mpAccessToken: "",
        mpPublicKey: "",
        smtpHost: "",
        smtpPort: 587,
        smtpEncryption: "tls",
        smtpUser: "",
        smtpPass: "",
        vimeoClientId: "",
        vimeoSecret: "",
        vimeoToken: "",
        timezone: "America/Sao_Paulo",
        sessionTimeout: 120,
        maintenanceMode: false
    });

    const tabs = [
        { id: "pagamento", label: "Gateways de Pagamento", icon: CreditCard },
        { id: "email", label: "Servidor de E-mail (SMTP)", icon: Mail },
        { id: "video", label: "Hospedagem de Vídeos", icon: Video },
        { id: "sistema", label: "Gerais do Sistema", icon: Server },
    ];

    useEffect(() => {
        const fetchSettings = async () => {
            setLoading(true);
            try {
                const res = await apiFetch(`/admin/settings`);
                if (res.ok) {
                    const data = await res.json();
                    setSettings(prev => ({ ...prev, ...data }));
                } else if (res.status !== 404) {
                    toast.error("Erro ao carregar configurações");
                }
            } catch (error) {
                console.error(error);
                toast.error("Erro de conexão com servidor");
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await apiFetch(`/admin/settings`, {
                method: "POST",
                body: JSON.stringify(settings)
            });

            if (res.ok) {
                toast.success("Configurações salvas com sucesso!");
            } else {
                toast.error("Falha ao salvar configurações");
            }
        } catch (error) {
            toast.error("Erro de conexão");
        } finally {
            setSaving(false);
        }
    };

    const updateSetting = (key: string, value: any) => {
        setSettings(prev => ({ ...prev, [key]: value }));
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
                    title="Configurações do Sistema"
                    description="Gerencie chaves de API, integrações e parâmetros gerais da plataforma."
                    badge="SISTEMA"
                />
                <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="h-12 rounded-xl font-bold px-8 gap-2 shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {saving ? "Salvando..." : "Salvar Configurações"}
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Menus Laterais */}
                <div className="lg:col-span-1 space-y-2">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold transition-all text-sm ${isActive
                                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                                    : "bg-card text-muted-foreground hover:bg-muted hover:text-foreground border border-border"
                                    }`}
                            >
                                <Icon className={`w-4 h-4 ${isActive ? "text-primary-foreground" : "text-muted-foreground"}`} />
                                <span className="text-[13px]">{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Conteúdo da Aba */}
                <div className="lg:col-span-3">
                    <div className="p-6 md:p-8 rounded-2xl bg-card border border-border shadow-sm min-h-[500px]">

                        {activeTab === "pagamento" && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div>
                                    <h3 className="text-xl font-bold text-foreground mb-1.5">Gateways de Pagamento</h3>
                                    <p className="text-muted-foreground text-sm">Configure as chaves e tokens para processamento de pagamentos.</p>
                                </div>

                                {/* Stripe */}
                                <div className="space-y-5 p-6 rounded-2xl bg-muted/30 border border-border">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-[#635BFF]/10 flex items-center justify-center text-[#635BFF]">
                                            <CreditCard className="w-5 h-5" />
                                        </div>
                                        <h4 className="text-[15px] font-bold text-foreground">Integração Stripe</h4>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Chave Pública (Publishable Key)</label>
                                        <input
                                            type="text"
                                            value={settings.stripePubKey}
                                            onChange={e => updateSetting("stripePubKey", e.target.value)}
                                            placeholder="pk_test_..."
                                            className="w-full h-11 px-4 rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-mono text-[13px]"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Chave Secreta (Secret Key)</label>
                                        <input
                                            type="password"
                                            value={settings.stripeSecretKey}
                                            onChange={e => updateSetting("stripeSecretKey", e.target.value)}
                                            placeholder="sk_test_..."
                                            className="w-full h-11 px-4 rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-mono text-[13px]"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Webhook Secret</label>
                                        <input
                                            type="password"
                                            value={settings.stripeWebhookSecret}
                                            onChange={e => updateSetting("stripeWebhookSecret", e.target.value)}
                                            placeholder="whsec_..."
                                            className="w-full h-11 px-4 rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-mono text-[13px]"
                                        />
                                    </div>
                                </div>

                                {/* Mercado Pago */}
                                <div className="space-y-5 p-6 rounded-2xl bg-muted/30 border border-border">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-[#009EE3]/10 flex items-center justify-center text-[#009EE3]">
                                            <CreditCard className="w-5 h-5" />
                                        </div>
                                        <h4 className="text-[15px] font-bold text-foreground">Mercado Pago</h4>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Access Token</label>
                                        <input
                                            type="password"
                                            value={settings.mpAccessToken}
                                            onChange={e => updateSetting("mpAccessToken", e.target.value)}
                                            placeholder="APP_USR-..."
                                            className="w-full h-11 px-4 rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-mono text-[13px]"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Public Key</label>
                                        <input
                                            type="text"
                                            value={settings.mpPublicKey}
                                            onChange={e => updateSetting("mpPublicKey", e.target.value)}
                                            placeholder="APP_USR-..."
                                            className="w-full h-11 px-4 rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-mono text-[13px]"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "email" && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div>
                                    <h3 className="text-xl font-bold text-foreground mb-1.5">Servidor de E-mail</h3>
                                    <p className="text-muted-foreground text-sm">Configurações de SMTP para envio de e-mails transacionais (Recuperação de senha, boas-vindas, etc).</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-6 rounded-2xl bg-muted/30 border border-border">
                                    <div className="space-y-1.5 md:col-span-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Host SMTP</label>
                                        <input
                                            type="text"
                                            value={settings.smtpHost}
                                            onChange={e => updateSetting("smtpHost", e.target.value)}
                                            placeholder="smtp.mailgun.org"
                                            className="w-full h-11 px-4 rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-mono text-[13px]"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Porta</label>
                                        <input
                                            type="number"
                                            value={settings.smtpPort}
                                            onChange={e => updateSetting("smtpPort", parseInt(e.target.value))}
                                            placeholder="587"
                                            className="w-full h-11 px-4 rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-mono text-[13px]"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Criptografia</label>
                                        <select
                                            value={settings.smtpEncryption}
                                            onChange={e => updateSetting("smtpEncryption", e.target.value)}
                                            className="w-full h-11 px-4 rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-semibold text-sm"
                                        >
                                            <option value="tls">TLS</option>
                                            <option value="ssl">SSL</option>
                                            <option value="none">Nenhuma</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5 md:col-span-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Usuário SMTP</label>
                                        <input
                                            type="text"
                                            value={settings.smtpUser}
                                            onChange={e => updateSetting("smtpUser", e.target.value)}
                                            placeholder="contato@seudominio.com"
                                            className="w-full h-11 px-4 rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-mono text-[13px]"
                                        />
                                    </div>
                                    <div className="space-y-1.5 md:col-span-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Senha SMTP</label>
                                        <input
                                            type="password"
                                            value={settings.smtpPass}
                                            onChange={e => updateSetting("smtpPass", e.target.value)}
                                            placeholder="••••••••••••••••"
                                            className="w-full h-11 px-4 rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-mono text-[13px]"
                                        />
                                    </div>
                                    <div className="space-y-1.5 md:col-span-2 pt-2">
                                        <Button
                                            variant="outline"
                                            className="w-full h-11 rounded-xl font-bold border-border text-foreground hover:bg-muted"
                                            onClick={() => toast.info("Funcionalidade de teste em breve")}
                                        >
                                            Testar Conexão SMTP
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "video" && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div>
                                    <h3 className="text-xl font-bold text-foreground mb-1.5">Hospedagem de Vídeos</h3>
                                    <p className="text-muted-foreground text-sm">Configure as chaves da API para os provedores de vídeo dos cursos (Vimeo).</p>
                                </div>

                                <div className="space-y-5 p-6 rounded-2xl bg-muted/30 border border-border">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-[#1AB7EA]/10 flex items-center justify-center text-[#1AB7EA]">
                                            <Video className="w-5 h-5" />
                                        </div>
                                        <h4 className="text-[15px] font-bold text-foreground">Vimeo Pro / Business</h4>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Client Identifier</label>
                                        <input
                                            type="text"
                                            value={settings.vimeoClientId}
                                            onChange={e => updateSetting("vimeoClientId", e.target.value)}
                                            className="w-full h-11 px-4 rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-mono text-[13px]"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Client Secrets</label>
                                        <input
                                            type="password"
                                            value={settings.vimeoSecret}
                                            onChange={e => updateSetting("vimeoSecret", e.target.value)}
                                            className="w-full h-11 px-4 rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-mono text-[13px]"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Personal Access Token</label>
                                        <input
                                            type="password"
                                            value={settings.vimeoToken}
                                            onChange={e => updateSetting("vimeoToken", e.target.value)}
                                            className="w-full h-11 px-4 rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-mono text-[13px]"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "sistema" && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div>
                                    <h3 className="text-xl font-bold text-foreground mb-1.5">Configurações Gerais</h3>
                                    <p className="text-muted-foreground text-sm">Ajuste itens críticos do funcionamento como fuso horário, limites e segurança.</p>
                                </div>

                                <div className="space-y-5 p-6 rounded-2xl bg-muted/30 border border-border">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Fuso Horário Principal (Timezone)</label>
                                        <select
                                            value={settings.timezone}
                                            onChange={e => updateSetting("timezone", e.target.value)}
                                            className="w-full h-11 px-4 rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-semibold text-sm text-foreground"
                                        >
                                            <option value="America/Sao_Paulo">America/Sao_Paulo (Horário de Brasília)</option>
                                            <option value="UTC">UTC (Universal Time)</option>
                                        </select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tempo Expirar Sessão (minutos)</label>
                                        <input
                                            type="number"
                                            value={settings.sessionTimeout}
                                            onChange={e => updateSetting("sessionTimeout", parseInt(e.target.value))}
                                            className="w-full h-11 px-4 rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-semibold text-sm text-foreground"
                                        />
                                    </div>

                                    <div className="pt-4 border-t border-border mt-2">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-bold text-foreground text-sm">Modo de Manutenção</h4>
                                                <p className="text-xs text-muted-foreground mt-0.5">Exibe uma tela de manutenção e impede acesso aos painéis públicos.</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={settings.maintenanceMode}
                                                    onChange={e => updateSetting("maintenanceMode", e.target.checked)}
                                                />
                                                <div className="w-12 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-destructive"></div>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
}
