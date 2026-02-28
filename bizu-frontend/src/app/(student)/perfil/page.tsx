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
import { compressImage, getAvatarUrl } from "@/lib/imageUtils";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPhone } from "@/lib/utils";
import SubscriptionManagementModal from "@/components/student/SubscriptionManagementModal";

const formatPrice = (price?: number | string, currency = "BRL") => {
    if (price === undefined || price === null || price === "") return null;

    const value = typeof price === "number" ? price : Number(price);
    if (Number.isNaN(value)) return null;

    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
    }).format(value);
};

const billingIntervalLabel = (interval?: string) => {
    switch (interval) {
        case "MONTHLY":
            return "mensal";
        case "YEARLY":
            return "anual";
        case "ONE_TIME":
            return "pagamento único";
        default:
            return "";
    }
};

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

type Device = {
    id: string;
    osInfo?: string;
    browserInfo?: string;
    lastIp?: string;
    lastSeenAt: string;
};

type Plan = {
    id: string;
    name?: string;
    price?: number | string;
    currency?: string;
    billingInterval?: string;
    course?: { id?: string };
};

type CourseSummary = {
    id: string;
    title: string;
};

export default function ProfilePage() {
    const { user, logout, selectedCourseId, refreshUserProfile, subscription, entitlements } = useAuth();
    const [devices, setDevices] = useState<Device[]>([]);
    const [plans, setPlans] = useState<Plan[]>([]);
    const [courseName, setCourseName] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);

    // Form states
    const [name, setName] = useState("");
    const [nickname, setNickname] = useState("");
    const [phone, setPhone] = useState("");
    const [isUploading, setIsUploading] = useState(false);

    // Verification states
    const [isVerifyingPhone, setIsVerifyingPhone] = useState(false);
    const [phoneCode, setPhoneCode] = useState("");
    const [isSendingCode, setIsSendingCode] = useState(false);

    useEffect(() => {
        if (user) {
            setName((user.name as string) || "");
            setNickname((user.nickname as string) || "");
            setPhone((user.phone as string) || "");
        }
    }, [user]);


    const requestPhoneChange = async () => {
        setIsSendingCode(true);
        try {
            const res = await apiFetch("/users/me/request-phone-change", {
                method: "POST",
                body: JSON.stringify({ phone })
            });
            if (res.ok) {
                setIsVerifyingPhone(true);
                toast.success("Código enviado via WhatsApp/SMS!");
            } else {
                toast.error(await res.text() || "Erro ao enviar código");
            }
        } catch {
            toast.error("Erro de conexão");
        } finally {
            setIsSendingCode(false);
        }
    };

    const confirmPhoneChange = async () => {
        setIsSaving(true);
        try {
            const res = await apiFetch("/users/me/confirm-phone-change", {
                method: "POST",
                body: JSON.stringify({ phone, code: phoneCode })
            });
            if (res.ok) {
                await refreshUserProfile();
                setIsVerifyingPhone(false);
                setPhoneCode("");
                toast.success("Telefone alterado com sucesso!");
            } else {
                toast.error(await res.text() || "Código inválido");
            }
        } catch {
            toast.error("Erro na verificação");
        } finally {
            setIsSaving(false);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [devicesRes, coursesRes, plansRes] = await Promise.all([
                    apiFetch("/devices"),
                    apiFetch("/public/courses"),
                    apiFetch("/public/plans")
                ]);

                if (devicesRes.ok) {
                    const data = await devicesRes.json();
                    setDevices(data);
                }

                if (plansRes.ok) {
                    const plansData = await plansRes.json();
                    setPlans(Array.isArray(plansData) ? plansData : []);
                }

                // Try to find course name from entitlements first (more reliable for students)
                const ent = entitlements?.find(e => e.course?.id === selectedCourseId);
                if (ent) {
                    setCourseName(ent.course.title);
                } else if (coursesRes.ok && selectedCourseId) {
                    const courses: CourseSummary[] = await coursesRes.json();
                    const currentCourse = courses.find((c) => c.id === selectedCourseId);
                    if (currentCourse) {
                        setCourseName(currentCourse.title);
                    }
                }
            } catch (err) {
                console.error("Failed to load profile data", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [selectedCourseId, entitlements]);

    const selectedEntitlement = entitlements?.find(e => e.course?.id === selectedCourseId && e.active);
    const selectedPlan = subscription && subscription?.plan?.course?.id === selectedCourseId
        ? subscription.plan
        : plans.find((plan) => plan.course?.id === selectedCourseId);
    const currentCourseLabel = selectedEntitlement?.course?.title || courseName || "Curso selecionado";
    const currentPlanLabel = subscription?.plan?.name
        || selectedPlan?.name
        || (selectedEntitlement?.source === "MANUAL" ? "Plano Vitalício" : "Plano Ativo");
    const currentPlanPrice = formatPrice(subscription?.plan?.price ?? selectedPlan?.price, subscription?.plan?.currency || selectedPlan?.currency || "BRL");
    const currentBillingInterval = billingIntervalLabel(subscription?.plan?.billingInterval || selectedPlan?.billingInterval);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await apiFetch("/users/me", {
                method: "PUT",
                body: JSON.stringify({ name, phone, nickname })
            });
            if (res.ok) {
                await refreshUserProfile();
                toast.success("Perfil atualizado com sucesso!");
            } else {
                const error = await res.text();
                toast.error(error || "Erro ao atualizar perfil");
            }
        } catch {
            toast.error("Erro de conexão");
        } finally {
            setIsSaving(false);
        }
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;

        setIsUploading(true);
        const originalFile = e.target.files[0];

        try {
            // Compress image to max 400x400 for avatars, 80% quality
            const compressedBlob = await compressImage(originalFile, 400, 400, 0.8);

            const formData = new FormData();
            formData.append("file", compressedBlob, originalFile.name.replace(/\.[^/.]+$/, "") + ".jpg");

            // No need to set Content-Type, browser will do it with boundary
            const res = await apiFetch("/users/me/avatar", {
                method: "POST",
                body: formData
            });

            if (res.ok) {
                await refreshUserProfile();
                toast.success("Foto de perfil atualizada!");
            } else {
                toast.error("Erro ao fazer upload da foto");
            }
        } catch (err) {
            console.error("Profile photo upload error:", err);
            toast.error("Erro ao enviar foto");
        } finally {
            setIsUploading(false);
        }
    };

    const removeDevice = async (id: string) => {
        try {
            const res = await apiFetch(`/devices/${id}`, { method: "DELETE" });
            if (res.ok) {
                setDevices(devices.filter(d => d.id !== id));
                toast.success("Dispositivo removido");
            }
        } catch {
            toast.error("Falha ao remover dispositivo");
        }
    };

    const isModified = name !== (user?.name || "") || nickname !== (user?.nickname || "");
    const phoneModified = phone !== (user?.phone || "");


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

                        {/* Avatar Upload Section */}
                        <div className="flex flex-col sm:flex-row items-center gap-8 mb-10 pb-10 border-b border-slate-50">
                            <div className="relative group">
                                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-[32px] overflow-hidden bg-slate-100 border-4 border-white shadow-xl flex items-center justify-center ring-1 ring-slate-100 transition-transform group-hover:scale-[1.02]">
                                    {isLoading ? (
                                        <Skeleton className="w-full h-full" />
                                    ) : user?.avatarUrl ? (
                                        <img
                                            src={getAvatarUrl(user.avatarUrl as string)}
                                            alt={user.name as string}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent((user?.name as string) || '')}&background=6366f1&color=fff`;
                                            }}
                                        />
                                    ) : (
                                        <div className="text-4xl font-black text-indigo-400">
                                            {user?.name?.slice(0, 1).toUpperCase()}
                                        </div>
                                    )}
                                    {isUploading && (
                                        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center">
                                            <Loader2 className="w-8 h-8 text-white animate-spin" />
                                        </div>
                                    )}
                                </div>
                                <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-white shadow-lg rounded-xl border border-slate-100 flex items-center justify-center cursor-pointer hover:bg-slate-50 transition-all active:scale-90 overflow-hidden">
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleAvatarUpload}
                                        disabled={isUploading}
                                    />
                                    <Smartphone className="w-5 h-5 text-slate-500" />
                                </label>
                            </div>

                            <div className="flex-1 text-center sm:text-left">
                                <h4 className="text-lg font-bold text-slate-900 mb-1">Sua Foto de Perfil</h4>
                                <p className="text-sm text-slate-500 mb-4 max-w-sm">
                                    Esta foto será visível para seus amigos e em rankings. Use uma imagem quadrada para melhor visualização.
                                </p>
                                <div className="flex flex-wrap justify-center sm:justify-start gap-3">
                                    <Button
                                        variant="outline"
                                        className="h-9 px-4 rounded-xl text-xs font-bold border-slate-200"
                                        onClick={() => (document.querySelector('input[type="file"]') as HTMLInputElement)?.click()}
                                    >
                                        Alterar Foto
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        className="h-9 px-4 rounded-xl text-xs font-bold text-slate-400 hover:text-danger hover:bg-danger/5"
                                    >
                                        Remover
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2.5">
                                <label className="text-sm font-bold text-slate-500 ml-1">Nome Completo</label>
                                {isLoading ? <Skeleton className="h-14 w-full rounded-2xl" /> : (
                                    <Input
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Seu nome"
                                        className="h-14 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-primary/10 focus:border-primary/20 transition-all text-base font-medium shadow-none"
                                    />
                                )}
                            </div>
                            <div className="space-y-2.5">
                                <label className="text-sm font-bold text-slate-500 ml-1">Nickname (Arena)</label>
                                {isLoading ? <Skeleton className="h-14 w-full rounded-2xl" /> : (
                                    <Input
                                        value={nickname}
                                        onChange={(e) => setNickname(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                                        placeholder="seu_nickname"
                                        className="h-14 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-primary/10 focus:border-primary/20 transition-all text-base font-medium shadow-none"
                                    />
                                )}
                                <p className="text-[10px] text-slate-400 ml-1">Apenas letras, números e underscore.</p>
                            </div>
                            <div className="space-y-2.5">
                                <label className="text-sm font-bold text-slate-500 ml-1">E-mail</label>
                                {isLoading ? <Skeleton className="h-14 w-full rounded-2xl" /> : (
                                    <div className="space-y-3">
                                        <div className="relative flex items-center gap-2">
                                            <Input
                                                value={user?.email || ""}
                                                disabled={true}
                                                className="h-14 rounded-2xl bg-slate-100 border-transparent transition-all text-base font-medium shadow-none opacity-70"
                                                placeholder="seu@email.com"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="space-y-2.5">
                                <label className="text-sm font-bold text-slate-500 ml-1">Telefone</label>
                                {isLoading ? <Skeleton className="h-14 w-full rounded-2xl" /> : (
                                    <div className="space-y-3">
                                        <div className="relative flex items-center gap-2">
                                            <Input
                                                value={phone}
                                                onChange={(e) => setPhone(formatPhone(e.target.value))}
                                                disabled={isSaving || isVerifyingPhone}
                                                placeholder="(00) 00000-0000"
                                                className={`h-14 rounded-2xl bg-slate-50 border-transparent focus:bg-white transition-all text-base font-medium shadow-none ${isVerifyingPhone ? 'opacity-50' : ''}`}
                                            />
                                            {phoneModified && !isVerifyingPhone && (
                                                <Button
                                                    onClick={requestPhoneChange}
                                                    disabled={isSendingCode}
                                                    className="absolute right-2 h-10 px-4 rounded-xl text-xs font-bold bg-primary text-white"
                                                >
                                                    {isSendingCode ? <Loader2 className="w-4 h-4 animate-spin" /> : "Enviar Código"}
                                                </Button>
                                            )}
                                        </div>
                                        {isVerifyingPhone && (
                                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2">
                                                <Input
                                                    value={phoneCode}
                                                    onChange={(e) => setPhoneCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                                    placeholder="Código de 6 dígitos"
                                                    className="h-12 rounded-xl flex-1 text-center font-bold tracking-[0.5em]"
                                                />
                                                <Button onClick={confirmPhoneChange} disabled={isSaving || phoneCode.length < 6} className="h-12 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
                                                    Verificar
                                                </Button>
                                                <Button variant="ghost" onClick={() => setIsVerifyingPhone(false)} className="h-12 px-4 rounded-xl text-slate-400">
                                                    Cancelar
                                                </Button>
                                            </motion.div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-6 p-4 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-start gap-3">
                            <Shield className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" />
                            <p className="text-xs text-indigo-800 font-medium leading-relaxed">
                                Para sua segurança, a alteração de <b>Telefone</b> exige a confirmação de um código enviado ao novo número informado. O e-mail não pode ser alterado por aqui.
                            </p>
                        </div>

                        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-6">
                            <p className="text-xs text-muted-foreground max-w-[300px] text-center sm:text-left">
                                Essas informações serão usadas para identificação em certificados e faturas de pagamento.
                            </p>
                            <Button
                                onClick={handleSave}
                                disabled={!isModified || isSaving}
                                className="btn-primary rounded-2xl px-10 h-14 font-black shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-95 transition-all w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
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
                            <h3 className="text-xl font-black">{subscription ? "Assinatura Ativa" : "Meu Plano"}</h3>
                        </div>

                        {isLoading ? (
                            <Skeleton className="h-32 w-full rounded-[32px] bg-muted/20" />
                        ) : subscription || selectedEntitlement ? (
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-8 rounded-[32px] bg-gradient-to-br from-indigo-50/50 to-indigo-100/30 border border-indigo-100/50 gap-6">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="text-2xl font-black text-indigo-600 uppercase tracking-tight">
                                            {currentPlanLabel}
                                        </div>
                                        <div className="pill pill-success text-[10px] scale-90">ATIVO</div>
                                    </div>

                                    <div className="text-sm font-semibold text-slate-900 mb-1">
                                        {currentCourseLabel}
                                    </div>

                                    <div className="text-sm font-medium text-slate-600 mb-1">
                                        {subscription ? (
                                            <>Sua assinatura renova em <span className="font-bold text-slate-900">{new Date(subscription.currentPeriodEnd).toLocaleDateString('pt-BR')}</span></>
                                        ) : (
                                            <>Acesso garantido via {selectedEntitlement?.source || 'Assinatura'}</>
                                        )}
                                    </div>

                                    {currentPlanPrice && (
                                        <div className="text-xs font-bold text-indigo-700 uppercase tracking-wide">
                                            {currentPlanPrice} {currentBillingInterval ? `• ${currentBillingInterval}` : ""}
                                        </div>
                                    )}
                                </div>
                                <Button
                                    onClick={() => setIsSubscriptionModalOpen(true)}
                                    className="rounded-2xl border-2 border-indigo-200 bg-white text-indigo-600 hover:bg-indigo-600 hover:text-white h-12 px-8 font-bold transition-all w-full md:w-auto"
                                >
                                    Gerenciar Assinatura
                                </Button>
                            </div>
                        ) : (
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-8 rounded-[32px] bg-slate-50 border border-slate-100 gap-6">
                                <div>
                                    <div className="text-xl font-black text-slate-900 mb-1">
                                        Plano Gratuito {courseName ? `• ${courseName}` : ""}
                                    </div>
                                    <div className="text-sm font-medium text-slate-500">Acesso limitado ao conteúdo básico e simulados públicos.</div>
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
                                <div className="space-y-4">
                                    <Skeleton className="h-24 w-full rounded-[28px]" />
                                    <Skeleton className="h-24 w-full rounded-[28px]" />
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
                                                {device.osInfo && device.osInfo.toLowerCase().includes("mobile") ? <Smartphone className="w-6 h-6 text-slate-600" /> : <Monitor className="w-6 h-6 text-slate-600" />}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-900 text-lg flex items-center gap-2">
                                                    {device.lastIp || "Desconhecido"}
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                </div>
                                                <div className="text-xs font-medium text-slate-500 flex flex-col gap-0.5">
                                                    <span className="truncate max-w-[240px] sm:max-w-md">{device.browserInfo || "Navegador desconhecido"} {device.osInfo ? `(${device.osInfo})` : ""}</span>
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
            <SubscriptionManagementModal
                open={isSubscriptionModalOpen}
                onOpenChange={setIsSubscriptionModalOpen}
            />
        </motion.div>
    );
}
