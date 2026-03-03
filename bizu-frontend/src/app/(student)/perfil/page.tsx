"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Smartphone, Monitor, Shield, LogOut, CreditCard,
    User as UserIcon, Loader2, CheckCircle2, Camera,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { compressImage, getAvatarUrl } from "@/lib/imageUtils";
import { formatPhone } from "@/lib/utils";
import SubscriptionManagementModal from "@/components/student/SubscriptionManagementModal";

const formatPrice = (price?: number | string, currency = "BRL") => {
    if (price === undefined || price === null || price === "") return null;
    const value = typeof price === "number" ? price : Number(price);
    if (Number.isNaN(value)) return null;
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency, minimumFractionDigits: 2 }).format(value);
};

const billingIntervalLabel = (interval?: string) => {
    switch (interval) {
        case "MONTHLY": return "mensal";
        case "YEARLY": return "anual";
        case "ONE_TIME": return "pagamento único";
        default: return "";
    }
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

type CourseSummary = { id: string; title: string };

type Tab = "profile" | "subscription" | "security";

export default function ProfilePage() {
    const { user, logout, selectedCourseId, refreshUserProfile, subscription, entitlements } = useAuth();
    const [devices, setDevices] = useState<Device[]>([]);
    const [plans, setPlans] = useState<Plan[]>([]);
    const [courseName, setCourseName] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<Tab>("profile");

    const [name, setName] = useState("");
    const [nickname, setNickname] = useState("");
    const [phone, setPhone] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);
    const [confirmingDeviceId, setConfirmingDeviceId] = useState<string | null>(null);

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
            const res = await apiFetch("/users/me/request-phone-change", { method: "POST", body: JSON.stringify({ phone }) });
            if (res.ok) { setIsVerifyingPhone(true); toast.success("Código enviado via WhatsApp/SMS!"); }
            else toast.error(await res.text() || "Erro ao enviar código");
        } catch { toast.error("Erro de conexão"); }
        finally { setIsSendingCode(false); }
    };

    const confirmPhoneChange = async () => {
        setIsSaving(true);
        try {
            const res = await apiFetch("/users/me/confirm-phone-change", { method: "POST", body: JSON.stringify({ phone, code: phoneCode }) });
            if (res.ok) { await refreshUserProfile(); setIsVerifyingPhone(false); setPhoneCode(""); toast.success("Telefone alterado com sucesso!"); }
            else toast.error(await res.text() || "Código inválido");
        } catch { toast.error("Erro na verificação"); }
        finally { setIsSaving(false); }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [devicesRes, coursesRes, plansRes] = await Promise.all([
                    apiFetch("/devices"),
                    apiFetch("/public/courses"),
                    apiFetch("/public/plans"),
                ]);
                if (devicesRes.ok) setDevices(await devicesRes.json());
                if (plansRes.ok) { const d = await plansRes.json(); setPlans(Array.isArray(d) ? d : []); }
                const ent = entitlements?.find(e => e.course?.id === selectedCourseId);
                if (ent) { setCourseName(ent.course.title); }
                else if (coursesRes.ok && selectedCourseId) {
                    const courses: CourseSummary[] = await coursesRes.json();
                    const c = courses.find(c => c.id === selectedCourseId);
                    if (c) setCourseName(c.title);
                }
            } catch (err) { console.error("Failed to load profile data", err); }
            finally { setIsLoading(false); }
        };
        fetchData();
    }, [selectedCourseId, entitlements]);

    const selectedEntitlement = entitlements?.find(e => e.course?.id === selectedCourseId && e.active);
    const selectedPlan = subscription && subscription?.plan?.course?.id === selectedCourseId
        ? subscription.plan
        : plans.find(p => p.course?.id === selectedCourseId);
    const currentCourseLabel = selectedEntitlement?.course?.title || courseName || "Curso selecionado";
    const currentPlanLabel = subscription?.plan?.name || selectedPlan?.name || (selectedEntitlement?.source === "MANUAL" ? "Plano Vitalício" : "Plano Ativo");
    const currentPlanPrice = formatPrice(subscription?.plan?.price ?? selectedPlan?.price, subscription?.plan?.currency || selectedPlan?.currency || "BRL");
    const currentBillingInterval = billingIntervalLabel(subscription?.plan?.billingInterval || selectedPlan?.billingInterval);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await apiFetch("/users/me", { method: "PUT", body: JSON.stringify({ name, phone, nickname }) });
            if (res.ok) { await refreshUserProfile(); toast.success("Perfil atualizado com sucesso!"); }
            else { const error = await res.text(); toast.error(error || "Erro ao atualizar perfil"); }
        } catch { toast.error("Erro de conexão"); }
        finally { setIsSaving(false); }
    };

    const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;
        const file = e.target.files[0];
        setPendingAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
        e.target.value = "";
    };

    const confirmAvatarUpload = async () => {
        if (!pendingAvatarFile) return;
        setIsUploading(true);
        try {
            const compressedBlob = await compressImage(pendingAvatarFile, 400, 400, 0.8);
            const formData = new FormData();
            formData.append("file", compressedBlob, pendingAvatarFile.name.replace(/\.[^/.]+$/, "") + ".jpg");
            const res = await apiFetch("/users/me/avatar", { method: "POST", body: formData });
            if (res.ok) { await refreshUserProfile(); toast.success("Foto de perfil atualizada!"); }
            else toast.error("Erro ao fazer upload da foto");
        } catch (err) { console.error("Avatar upload error:", err); toast.error("Erro ao enviar foto"); }
        finally { setIsUploading(false); setAvatarPreview(null); setPendingAvatarFile(null); }
    };

    const cancelAvatarPreview = () => {
        if (avatarPreview) URL.revokeObjectURL(avatarPreview);
        setAvatarPreview(null);
        setPendingAvatarFile(null);
    };

    const removeDevice = async (id: string) => {
        try {
            const res = await apiFetch(`/devices/${id}`, { method: "DELETE" });
            if (res.ok) { setDevices(devices.filter(d => d.id !== id)); setConfirmingDeviceId(null); toast.success("Dispositivo removido"); }
        } catch { toast.error("Falha ao remover dispositivo"); }
    };

    const isModified = name !== (user?.name || "") || nickname !== (user?.nickname || "");
    const phoneModified = phone !== (user?.phone || "");

    const TABS = [
        { id: "profile" as Tab, label: "Perfil", icon: UserIcon },
        { id: "subscription" as Tab, label: "Assinatura", icon: CreditCard },
        { id: "security" as Tab, label: "Sessões", icon: Shield },
    ];

    return (
        <div className="flex flex-col min-h-full bg-slate-50">

            {/* ── Hero Header ───────────────────────────────── */}
            <div className="relative bg-gradient-to-b from-indigo-700 via-indigo-600 to-indigo-500 px-5 pt-8 pb-0 overflow-hidden">
                {/* Ambient glow */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute -top-16 -right-16 w-64 h-64 bg-violet-400/20 rounded-full blur-3xl" />
                    <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-indigo-300/10 rounded-full blur-2xl" />
                </div>

                {/* Profile identity */}
                <div className="relative flex flex-col items-center text-center pb-6">
                    {/* Avatar */}
                    <div className="relative mb-4">
                        <div className="w-24 h-24 rounded-[28px] overflow-hidden ring-4 ring-white/25 ring-offset-2 ring-offset-indigo-600 shadow-2xl shadow-indigo-900/40">
                            {isLoading ? (
                                <div className="w-full h-full bg-indigo-400/40 animate-pulse" />
                            ) : avatarPreview ? (
                                <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                            ) : user?.avatarUrl ? (
                                <img
                                    src={getAvatarUrl(user.avatarUrl as string)}
                                    alt={user.name as string}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent((user?.name as string) || "")}&background=4f46e5&color=fff&bold=true`;
                                    }}
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center">
                                    <span className="text-3xl font-black text-white">
                                        {user?.name?.slice(0, 1).toUpperCase() || "?"}
                                    </span>
                                </div>
                            )}
                            {isUploading && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                    <Loader2 className="w-7 h-7 text-white animate-spin" />
                                </div>
                            )}
                        </div>

                        {!avatarPreview ? (
                            <label className="absolute -bottom-1.5 -right-1.5 w-8 h-8 bg-white rounded-xl flex items-center justify-center cursor-pointer shadow-lg shadow-indigo-900/30 active:scale-90 transition-transform">
                                <Camera className="w-4 h-4 text-indigo-600" />
                                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={isUploading} />
                            </label>
                        ) : (
                            <div className="absolute -bottom-1.5 -right-1.5 flex gap-1">
                                <button onClick={confirmAvatarUpload} disabled={isUploading} className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg active:scale-90 transition-transform">
                                    <CheckCircle2 className="w-4 h-4 text-white" />
                                </button>
                                <button onClick={cancelAvatarPreview} className="w-8 h-8 bg-red-400 rounded-xl flex items-center justify-center shadow-lg active:scale-90 transition-transform">
                                    <span className="text-white text-xs font-black">✕</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {isLoading ? (
                        <div className="space-y-2">
                            <div className="h-7 w-48 bg-white/20 rounded-xl animate-pulse" />
                            <div className="h-4 w-28 bg-white/10 rounded-xl animate-pulse" />
                        </div>
                    ) : (
                        <>
                            <h1 className="text-[22px] font-black text-white tracking-tight leading-tight">
                                {user?.name || "Carregando..."}
                            </h1>
                            {user?.nickname && (
                                <p className="text-sm font-semibold text-indigo-200 mt-0.5">@{user.nickname}</p>
                            )}
                        </>
                    )}

                    {/* Plan badge */}
                    <div className="mt-3 flex items-center gap-2 bg-white/15 border border-white/20 rounded-full px-4 py-1.5 backdrop-blur-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                        <span className="text-xs font-bold text-white/90 uppercase tracking-wider">
                            {isLoading ? "..." : (subscription || selectedEntitlement ? currentPlanLabel : "Plano Gratuito")}
                        </span>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-1 bg-black/20 backdrop-blur-sm rounded-t-2xl p-1.5">
                    {TABS.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-[14px] text-xs font-bold transition-all active:scale-95 ${activeTab === tab.id
                                    ? "bg-white text-indigo-700 shadow-sm"
                                    : "text-white/60 hover:text-white/80"
                                }`}
                        >
                            <tab.icon className="w-3.5 h-3.5" />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Tab Content ───────────────────────────────── */}
            <div className="flex-1 px-4 pt-5 pb-10 space-y-3">
                <AnimatePresence mode="wait">

                    {/* ── PERFIL TAB ── */}
                    {activeTab === "profile" && (
                        <motion.div
                            key="profile"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.18 }}
                            className="space-y-3"
                        >
                            {/* Dados pessoais */}
                            <div className="bg-white rounded-[20px] overflow-hidden shadow-sm border border-slate-100">
                                <div className="px-5 pt-4 pb-3 border-b border-slate-50">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dados Pessoais</span>
                                </div>
                                <div className="p-4 space-y-3">
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-0.5 mb-1.5 block">Nome Completo</label>
                                        {isLoading ? (
                                            <div className="h-12 bg-slate-100 rounded-2xl animate-pulse" />
                                        ) : (
                                            <Input
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                placeholder="Seu nome completo"
                                                className="h-12 rounded-2xl bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-indigo-500/20 focus:border-indigo-400/50 text-sm font-medium shadow-none"
                                            />
                                        )}
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-0.5 mb-1.5 block">Nickname <span className="text-indigo-500">Arena</span></label>
                                        {isLoading ? (
                                            <div className="h-12 bg-slate-100 rounded-2xl animate-pulse" />
                                        ) : (
                                            <Input
                                                value={nickname}
                                                onChange={(e) => setNickname(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                                                placeholder="seu_nickname"
                                                className="h-12 rounded-2xl bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-indigo-500/20 focus:border-indigo-400/50 text-sm font-medium shadow-none"
                                            />
                                        )}
                                        <p className="text-[10px] text-slate-400 ml-0.5 mt-1.5">Letras, números e underscore. Visível no ranking.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Contato */}
                            <div className="bg-white rounded-[20px] overflow-hidden shadow-sm border border-slate-100">
                                <div className="px-5 pt-4 pb-3 border-b border-slate-50">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contato</span>
                                </div>
                                <div className="p-4 space-y-3">
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-0.5 mb-1.5 block">E-mail</label>
                                        <div className="h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center px-4 gap-2">
                                            <span className="text-sm font-medium text-slate-400 flex-1 truncate">{user?.email || "—"}</span>
                                            <span className="text-[10px] font-bold text-slate-400 bg-slate-200 px-2 py-0.5 rounded-full uppercase tracking-wide shrink-0">fixo</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-0.5 mb-1.5 block">Telefone</label>
                                        <div className="relative">
                                            <Input
                                                value={phone}
                                                onChange={(e) => setPhone(formatPhone(e.target.value))}
                                                disabled={isSaving || isVerifyingPhone}
                                                placeholder="(00) 00000-0000"
                                                className={`h-12 rounded-2xl bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 text-sm font-medium shadow-none pr-32 ${isVerifyingPhone ? "opacity-50" : ""}`}
                                            />
                                            {phoneModified && !isVerifyingPhone && (
                                                <Button
                                                    onClick={requestPhoneChange}
                                                    disabled={isSendingCode}
                                                    className="absolute right-1.5 top-1/2 -translate-y-1/2 h-9 px-3 rounded-xl text-xs font-bold bg-indigo-600 text-white shadow-none hover:bg-indigo-700"
                                                >
                                                    {isSendingCode ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Enviar Código"}
                                                </Button>
                                            )}
                                        </div>
                                        {isVerifyingPhone && (
                                            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="mt-2 flex gap-2">
                                                <Input
                                                    value={phoneCode}
                                                    onChange={(e) => setPhoneCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                                    placeholder="000000"
                                                    className="h-11 rounded-xl flex-1 text-center font-black tracking-[0.5em] bg-slate-50 border-slate-200 text-slate-900"
                                                />
                                                <Button onClick={confirmPhoneChange} disabled={isSaving || phoneCode.length < 6} className="h-11 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs">
                                                    {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Verificar"}
                                                </Button>
                                                <Button variant="ghost" onClick={() => setIsVerifyingPhone(false)} className="h-11 px-3 rounded-xl text-slate-400 text-xs">✕</Button>
                                            </motion.div>
                                        )}
                                    </div>

                                    <div className="flex items-start gap-3 bg-indigo-50 border border-indigo-100 rounded-2xl p-3 mt-1">
                                        <Shield className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                                        <p className="text-[11px] text-indigo-700/80 leading-relaxed font-medium">
                                            Alteração de telefone exige confirmação via WhatsApp/SMS. O e-mail não pode ser alterado por aqui.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Save */}
                            <Button
                                onClick={handleSave}
                                disabled={!isModified || isSaving}
                                className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-base shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                {isSaving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                                Salvar Alterações
                            </Button>
                        </motion.div>
                    )}

                    {/* ── ASSINATURA TAB ── */}
                    {activeTab === "subscription" && (
                        <motion.div
                            key="subscription"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.18 }}
                            className="space-y-3"
                        >
                            {isLoading ? (
                                <div className="h-52 bg-white rounded-[20px] animate-pulse shadow-sm" />
                            ) : subscription || selectedEntitlement ? (
                                <>
                                    {/* Plan card */}
                                    <div className="relative overflow-hidden rounded-[20px] shadow-sm">
                                        <div className="bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-700 p-6">
                                            <div className="absolute inset-0 opacity-20">
                                                <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
                                            </div>
                                            <div className="relative">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <div className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                                                    <span className="text-[10px] font-black text-emerald-300 uppercase tracking-widest">Ativo</span>
                                                </div>
                                                <div className="flex items-start justify-between gap-2 mb-4">
                                                    <div>
                                                        <h3 className="text-2xl font-black text-white tracking-tight uppercase leading-tight">{currentPlanLabel}</h3>
                                                        <p className="text-sm font-semibold text-indigo-200 mt-0.5">{currentCourseLabel}</p>
                                                    </div>
                                                    {currentPlanPrice && (
                                                        <div className="text-right shrink-0">
                                                            <div className="text-xl font-black text-white">{currentPlanPrice}</div>
                                                            {currentBillingInterval && (
                                                                <div className="text-xs text-indigo-300 font-semibold">{currentBillingInterval}</div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                                {subscription && (
                                                    <div className="bg-black/20 border border-white/10 rounded-2xl px-4 py-3 mb-4">
                                                        <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider mb-0.5">Próxima renovação</p>
                                                        <p className="text-sm font-bold text-white">
                                                            {new Date(subscription.currentPeriodEnd).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
                                                        </p>
                                                    </div>
                                                )}
                                                <Button
                                                    onClick={() => setIsSubscriptionModalOpen(true)}
                                                    className="w-full h-12 rounded-2xl bg-white text-indigo-700 hover:bg-indigo-50 font-bold active:scale-[0.98] transition-all shadow-none"
                                                >
                                                    Gerenciar Assinatura
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-[20px] p-4 shadow-sm border border-slate-100">
                                        <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                            Para cancelar ou alterar seu plano, use o botão <b>Gerenciar Assinatura</b> acima. Em caso de dúvidas, acesse o <Link href="/faturamento" className="text-indigo-600 font-bold">histórico de faturamento</Link>.
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <div className="bg-white rounded-[20px] p-6 shadow-sm border border-slate-100">
                                    <div className="text-center mb-5">
                                        <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                            <CreditCard className="w-7 h-7 text-indigo-400" />
                                        </div>
                                        <h3 className="text-lg font-black text-slate-900 mb-1">Plano Gratuito</h3>
                                        <p className="text-sm text-slate-500 font-medium leading-relaxed">
                                            Acesso limitado ao conteúdo básico e simulados públicos.
                                        </p>
                                    </div>
                                    <Link href="/pricing">
                                        <Button className="w-full h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold active:scale-[0.98] transition-all shadow-none">
                                            Ver Planos
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* ── SESSÕES TAB ── */}
                    {activeTab === "security" && (
                        <motion.div
                            key="security"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.18 }}
                            className="space-y-3"
                        >
                            <div className="flex items-center justify-between px-0.5">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dispositivos conectados</span>
                                <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                                    {devices.length}
                                </span>
                            </div>

                            <div className="bg-white rounded-[20px] overflow-hidden shadow-sm border border-slate-100 divide-y divide-slate-50">
                                {isLoading ? (
                                    <>
                                        {[1, 2].map(i => (
                                            <div key={i} className="p-4 flex items-center gap-4">
                                                <div className="w-11 h-11 bg-slate-100 rounded-[14px] animate-pulse shrink-0" />
                                                <div className="flex-1 space-y-2">
                                                    <div className="h-3.5 bg-slate-100 rounded animate-pulse w-2/3" />
                                                    <div className="h-3 bg-slate-100 rounded animate-pulse w-1/2" />
                                                </div>
                                            </div>
                                        ))}
                                    </>
                                ) : devices.length === 0 ? (
                                    <div className="py-12 text-center">
                                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                            <Monitor className="w-6 h-6 text-slate-300" />
                                        </div>
                                        <p className="text-sm font-medium text-slate-400">Nenhum dispositivo encontrado.</p>
                                    </div>
                                ) : (
                                    devices.map((device) => (
                                        <div key={device.id} className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-11 h-11 shrink-0 rounded-[14px] bg-slate-50 border border-slate-100 flex items-center justify-center">
                                                    {device.osInfo?.toLowerCase().includes("mobile")
                                                        ? <Smartphone className="w-5 h-5 text-slate-500" />
                                                        : <Monitor className="w-5 h-5 text-slate-500" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="font-bold text-slate-900 text-sm">{device.lastIp || "IP desconhecido"}</span>
                                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                                                    </div>
                                                    <p className="text-[11px] text-slate-500 truncate leading-snug">
                                                        {device.browserInfo || "Navegador desconhecido"}
                                                        {device.osInfo ? ` • ${device.osInfo}` : ""}
                                                    </p>
                                                    <p className="text-[10px] text-slate-400 mt-0.5">
                                                        {new Date(device.lastSeenAt).toLocaleString("pt-BR")}
                                                    </p>
                                                </div>
                                                <div className="shrink-0">
                                                    {confirmingDeviceId === device.id ? (
                                                        <div className="flex flex-col gap-1.5 items-end">
                                                            <button
                                                                onClick={() => removeDevice(device.id)}
                                                                className="px-3 py-1.5 bg-red-500 text-white text-[11px] font-bold rounded-xl active:scale-95 transition-transform"
                                                            >
                                                                Confirmar
                                                            </button>
                                                            <button
                                                                onClick={() => setConfirmingDeviceId(null)}
                                                                className="px-3 py-1.5 bg-slate-100 text-slate-500 text-[11px] font-bold rounded-xl active:scale-95 transition-transform"
                                                            >
                                                                Cancelar
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => setConfirmingDeviceId(device.id)}
                                                            className="h-9 w-9 flex items-center justify-center rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 active:scale-90 transition-all"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-100 rounded-[16px] p-4">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-xs font-bold text-emerald-800 mb-0.5">Conta protegida</p>
                                    <p className="text-[11px] text-emerald-700/70 leading-relaxed font-medium">
                                        Não reconheceu algum dispositivo? Remova-o e troque sua senha imediatamente.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                </AnimatePresence>

                {/* ── Logout ── */}
                <button
                    onClick={logout}
                    className="w-full py-4 rounded-2xl bg-red-50 border border-red-100 text-red-500 font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all hover:bg-red-100/60 mt-1"
                >
                    <LogOut className="w-4 h-4" />
                    Sair da Conta
                </button>
            </div>

            <SubscriptionManagementModal open={isSubscriptionModalOpen} onOpenChange={setIsSubscriptionModalOpen} />
        </div>
    );
}
