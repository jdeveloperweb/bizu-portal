"use client";

import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Smartphone, Monitor, Shield, LogOut, CreditCard, User as UserIcon, Loader2, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import { motion } from "framer-motion";
import Link from "next/link";

const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
};

export default function ProfilePage() {
    const { user, logout, selectedCourseId, refreshUserProfile } = useAuth();
    const [devices, setDevices] = useState<any[]>([]);
    const [subscription, setSubscription] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Form states
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");

    useEffect(() => {
        if (user) {
            setName(user.name || "");
            setPhone(user.phone || "");
        }
    }, [user]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [devicesRes, subRes] = await Promise.all([
                    apiFetch("/devices"),
                    apiFetch("/subscriptions/me")
                ]);

                if (devicesRes.ok) {
                    const data = await devicesRes.json();
                    setDevices(data);
                }

                if (subRes.ok) {
                    const data = await subRes.json();
                    setSubscription(data);
                }
            } catch (err) {
                console.error("Failed to load profile data", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await apiFetch("/users/me", {
                method: "PUT",
                body: JSON.stringify({ name, phone })
            });
            if (res.ok) {
                await refreshUserProfile();
                toast.success("Perfil atualizado com sucesso!");
            } else {
                toast.error("Erro ao atualizar perfil");
            }
        } catch (err) {
            toast.error("Erro de conexão");
        } finally {
            setIsSaving(false);
        }
    };

    const removeDevice = async (id: string) => {
        try {
            const res = await apiFetch(`/devices/${id}`, { method: "DELETE" });
            if (res.ok) {
                setDevices(devices.filter(d => d.id !== id));
                toast.success("Dispositivo removido");
            }
        } catch (err) {
            toast.error("Falha ao remover dispositivo");
        }
    };

    const isModified = name !== (user?.name || "") || phone !== (user?.phone || "");


    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="w-full px-8 py-12"
        >
            <PageHeader
                title="Minha Conta"
                description="Gerencie seus dados pessoais, assinaturas e dispositivos conectados."
                badge="CONFIGURAÇÕES"
            />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-12">
                {/* Sidebar Nav */}
                <div className="lg:col-span-1">
                    <nav className="sticky top-24 space-y-2">
                        {[
                            { label: "Dados Pessoais", icon: UserIcon, active: true, sectionId: "personal" },
                            { label: "Assinatura", icon: CreditCard, sectionId: "subscription" },
                            { label: "Segurança & Sessões", icon: Shield, sectionId: "security" },
                        ].map((item) => (
                            <div key={item.label}
                                onClick={() => document.getElementById(item.sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                                className={`flex items-center gap-3 p-4 rounded-[20px] font-bold cursor-pointer transition-all active:scale-95 ${item.active
                                    ? "bg-white text-primary shadow-sm ring-1 ring-slate-100"
                                    : "text-muted-foreground hover:bg-slate-50 hover:text-foreground"
                                    }`}>
                                <item.icon className="w-5 h-5" />
                                <span className="text-sm">{item.label}</span>
                            </div>
                        ))}

                        <div className="h-px bg-slate-100 my-6" />

                        <button
                            onClick={logout}
                            className="flex items-center gap-3 p-4 rounded-[20px] font-bold text-danger hover:bg-danger/5 w-full transition-all active:scale-95"
                        >
                            <LogOut className="w-5 h-5" />
                            <span className="text-sm">Sair da Conta</span>
                        </button>
                    </nav>
                </div>

                {/* Content Area */}
                <div className="lg:col-span-3 space-y-8">
                    {/* Section: Personal Info */}
                    <motion.div id="personal" variants={itemVariants} className="p-8 rounded-[40px] bg-white border border-slate-100 shadow-sm transition-all hover:shadow-md">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                <UserIcon className="w-5 h-5 text-primary" />
                            </div>
                            <h3 className="text-xl font-black">Dados Pessoais</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2.5">
                                <label className="text-sm font-bold text-slate-500 ml-1">Nome Completo</label>
                                <Input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Seu nome"
                                    className="h-14 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-primary/10 focus:border-primary/20 transition-all text-base font-medium shadow-none"
                                />
                            </div>
                            <div className="space-y-2.5">
                                <label className="text-sm font-bold text-slate-500 ml-1">E-mail</label>
                                <Input
                                    value={user?.email || ""}
                                    disabled
                                    className="h-14 rounded-2xl bg-slate-50/50 border-transparent cursor-not-allowed text-base font-medium opacity-60 shadow-none"
                                />
                            </div>
                            <div className="space-y-2.5">
                                <label className="text-sm font-bold text-slate-500 ml-1">Telefone</label>
                                <Input
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="(00) 00000-0000"
                                    className="h-14 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-primary/10 focus:border-primary/20 transition-all text-base font-medium shadow-none"
                                />
                            </div>
                        </div>

                        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-6">
                            <p className="text-xs text-muted-foreground max-w-[300px] text-center sm:text-left">
                                Essas informações serão usadas para identificação em certificados e faturas de pagamento.
                            </p>
                            <Button
                                onClick={handleSave}
                                disabled={!isModified || isSaving}
                                className="rounded-2xl px-10 h-14 font-black shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-95 transition-all w-full sm:w-auto"
                            >
                                {isSaving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                                Salvar Alterações
                            </Button>
                        </div>
                    </motion.div>

                    {/* Section: Subscription */}
                    <motion.div id="subscription" variants={itemVariants} className="p-8 rounded-[40px] bg-white border border-slate-100 shadow-sm transition-all hover:shadow-md">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                                <CreditCard className="w-5 h-5 text-indigo-600" />
                            </div>
                            <h3 className="text-xl font-black">Assinatura Ativa</h3>
                        </div>

                        {subscription ? (
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-8 rounded-[32px] bg-gradient-to-br from-indigo-50/50 to-indigo-100/30 border border-indigo-100/50 gap-6">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="text-2xl font-black text-indigo-600 uppercase tracking-tight">{subscription.plan?.name}</div>
                                        <div className="pill pill-success text-[10px] scale-90">ATIVO</div>
                                    </div>
                                    <div className="text-sm font-medium text-slate-600">
                                        Sua assinatura renova em <span className="font-bold text-slate-900">{new Date(subscription.currentPeriodEnd).toLocaleDateString('pt-BR')}</span>
                                    </div>
                                </div>
                                <Button className="rounded-2xl border-2 border-indigo-200 bg-white text-indigo-600 hover:bg-indigo-600 hover:text-white h-12 px-8 font-bold transition-all w-full md:w-auto">
                                    Gerenciar Assinatura
                                </Button>
                            </div>
                        ) : (
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-8 rounded-[32px] bg-slate-50 border border-slate-100 gap-6">
                                <div>
                                    <div className="text-xl font-black text-slate-900 mb-1">Plano Gratuito</div>
                                    <div className="text-sm font-medium text-slate-500 font-brand">Acesso limitado ao conteúdo básico e simulados públicos.</div>
                                </div>
                                <Link href="/pricing">
                                    <Button className="btn-primary rounded-2xl h-12 px-8 font-bold w-full md:w-auto">
                                        Fazer Upgrade
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </motion.div>

                    {/* Section: Security/Devices */}
                    <motion.div id="security" variants={itemVariants} className="p-8 rounded-[40px] bg-white border border-slate-100 shadow-sm transition-all hover:shadow-md">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                                    <Shield className="w-5 h-5 text-emerald-600" />
                                </div>
                                <h3 className="text-xl font-black">Dispositivos Conectados</h3>
                            </div>
                            <span className="text-[10px] font-black text-slate-500 bg-slate-100 px-4 py-1.5 rounded-full uppercase tracking-wider">
                                {devices.length} {devices.length === 1 ? 'dispositivo' : 'dispositivos'}
                            </span>
                        </div>

                        <div className="space-y-4">
                            {isLoading ? (
                                <div className="flex items-center justify-center py-10">
                                    <Loader2 className="w-6 h-6 text-primary animate-spin" />
                                </div>
                            ) : devices.length === 0 ? (
                                <div className="text-center py-10 border-2 border-dashed border-slate-100 rounded-[32px]">
                                    <p className="text-sm font-medium text-slate-400">Nenhum dispositivo encontrado.</p>
                                </div>
                            ) : (
                                devices.map((device) => (
                                    <div key={device.id} className="flex items-center justify-between p-6 rounded-[28px] border border-slate-100 hover:border-emerald-100 hover:bg-emerald-50/30 transition-all group">
                                        <div className="flex items-center gap-5">
                                            <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center border border-slate-100 group-hover:border-emerald-100 transition-all shadow-sm">
                                                {device.userAgent && device.userAgent.toLowerCase().includes("mobile") ? <Smartphone className="w-6 h-6 text-slate-600" /> : <Monitor className="w-6 h-6 text-slate-600" />}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-900 text-lg flex items-center gap-2">
                                                    {device.ipAddress || "Desconhecido"}
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                </div>
                                                <div className="text-xs font-medium text-slate-500 flex flex-col gap-0.5">
                                                    <span className="truncate max-w-[240px] sm:max-w-md">{device.userAgent || "Navegador desconhecido"}</span>
                                                    <span>Visto por último em {new Date(device.lastSeenAt).toLocaleString('pt-BR')}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            className="text-danger font-black hover:bg-danger/5 rounded-xl h-10 px-4 transition-all opacity-0 group-hover:opacity-100"
                                            onClick={() => removeDevice(device.id)}
                                        >
                                            Remover
                                        </Button>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="mt-8 p-6 rounded-[28px] bg-emerald-50/50 border border-emerald-100 flex items-start gap-4">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                            <div>
                                <h4 className="text-sm font-bold text-emerald-900 mb-1">Sua conta está protegida</h4>
                                <p className="text-xs text-emerald-700/80 leading-relaxed font-medium">
                                    Monitoramos acessos suspeitos em tempo real. Se você não reconhecer algum dispositivo acima, remova-o imediatamente e troque sua senha para garantir sua privacidade.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}
