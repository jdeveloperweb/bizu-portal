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
import { formatPhone, cn } from "@/lib/utils";
import SubscriptionManagementModal from "@/components/student/SubscriptionManagementModal";
import { Avatar } from "@/components/ui/Avatar";

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

type Device = { id: string; osInfo?: string; browserInfo?: string; lastIp?: string; lastSeenAt: string };
type Plan = { id: string; name?: string; price?: number | string; currency?: string; billingInterval?: string; course?: { id?: string } };
type CourseSummary = { id: string; title: string };
type Tab = "profile" | "subscription" | "security";

const TABS: { id: Tab; label: string; icon: React.ElementType; desktopLabel: string }[] = [
    { id: "profile", label: "Perfil", desktopLabel: "Dados Pessoais", icon: UserIcon },
    { id: "subscription", label: "Assinatura", desktopLabel: "Assinatura", icon: CreditCard },
    { id: "security", label: "Sessões", desktopLabel: "Sessões & Segurança", icon: Shield },
];

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
                    apiFetch("/devices"), apiFetch("/public/courses"), apiFetch("/public/plans"),
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
        ? subscription.plan : plans.find(p => p.course?.id === selectedCourseId);
    const currentCourseLabel = selectedEntitlement?.course?.title || courseName || "Curso selecionado";
    const currentPlanLabel = subscription?.plan?.name || selectedPlan?.name || (selectedEntitlement?.source === "MANUAL" ? "Plano Vitalício" : "Plano Ativo");
    const currentPlanPrice = formatPrice(subscription?.plan?.price ?? selectedPlan?.price, subscription?.plan?.currency || selectedPlan?.currency || "BRL");
    const currentBillingInterval = billingIntervalLabel(subscription?.plan?.billingInterval || selectedPlan?.billingInterval);
    const hasActiveSubscription = !!(subscription || selectedEntitlement);

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

    // ─── Avatar render ───────────────────────────────────────────────────────
    const AvatarImage = ({ size = "md" }: { size?: "sm" | "md" | "xl" }) => {
        return (
            <div className="relative">
                <Avatar
                    src={avatarPreview || (user?.avatarUrl ? getAvatarUrl(user.avatarUrl as string) : undefined)}
                    name={user?.name || ""}
                    size={size}
                    rankLevel={user?.level}
                    activeAura={user?.activeAura}
                    activeBorder={user?.activeBorder}
                    auraMetadata={user?.auraMetadata}
                    borderMetadata={user?.borderMetadata}
                    className={cn(
                        "ring-4 ring-white/25 ring-offset-2 ring-offset-indigo-600 shadow-xl shadow-indigo-900/30",
                        size === "sm" ? "rounded-[18px]" : "rounded-[28px]"
                    )}
                />
                {isUploading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-[28px] z-10">
                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                    </div>
                )}
            </div>
        );
    };

    // ─── Shared field components ─────────────────────────────────────────────
    const inputCls = "h-12 rounded-2xl bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-indigo-500/20 focus:border-indigo-400/50 text-sm font-medium shadow-none";
    const labelCls = "text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-0.5 mb-1.5 block";
    const skeletonRow = <div className="h-12 bg-slate-100 rounded-2xl animate-pulse" />;

    const DeviceRow = ({ device }: { device: Device }) => (
        <div className="p-4 lg:p-5">
            <div className="flex items-center gap-3 lg:gap-4">
                <div className="w-11 h-11 lg:w-12 lg:h-12 shrink-0 rounded-[14px] bg-slate-50 border border-slate-100 flex items-center justify-center">
                    {device.osInfo?.toLowerCase().includes("mobile")
                        ? <Smartphone className="w-5 h-5 text-slate-500" />
                        : <Monitor className="w-5 h-5 text-slate-500" />}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 text-sm">{device.lastIp || "IP desconhecido"}</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">
                        {device.browserInfo || "Navegador desconhecido"}{device.osInfo ? ` • ${device.osInfo}` : ""}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{new Date(device.lastSeenAt).toLocaleString("pt-BR")}</p>
                </div>
                <div className="shrink-0">
                    {confirmingDeviceId === device.id ? (
                        <div className="flex flex-col gap-1.5 items-end">
                            <button onClick={() => removeDevice(device.id)} className="px-3 py-1.5 bg-red-500 text-white text-[11px] font-bold rounded-xl active:scale-95 transition-transform">Confirmar</button>
                            <button onClick={() => setConfirmingDeviceId(null)} className="px-3 py-1.5 bg-slate-100 text-slate-500 text-[11px] font-bold rounded-xl active:scale-95 transition-transform">Cancelar</button>
                        </div>
                    ) : (
                        <button onClick={() => setConfirmingDeviceId(device.id)} className="h-9 w-9 flex items-center justify-center rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 active:scale-90 transition-all">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );

    // ─── Tab content ─────────────────────────────────────────────────────────
    const TabContent = () => (
        <AnimatePresence mode="wait">
            {/* ── PERFIL ── */}
            {activeTab === "profile" && (
                <motion.div key="profile" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
                    {/* Cards: stack on mobile, side-by-side on desktop */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
                        {/* Dados pessoais */}
                        <div className="bg-white rounded-[20px] overflow-hidden shadow-sm border border-slate-100">
                            <div className="px-5 pt-4 pb-3 border-b border-slate-50">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dados Pessoais</span>
                            </div>
                            <div className="p-4 lg:p-5 space-y-4">
                                <div>
                                    <label className={labelCls}>Nome Completo</label>
                                    {isLoading ? skeletonRow : (
                                        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome completo" className={inputCls} />
                                    )}
                                </div>
                                <div>
                                    <label className={labelCls}>Nickname <span className="text-indigo-500">Arena</span></label>
                                    {isLoading ? skeletonRow : (
                                        <Input value={nickname} onChange={(e) => setNickname(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))} placeholder="seu_nickname" className={inputCls} />
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
                            <div className="p-4 lg:p-5 space-y-4">
                                <div>
                                    <label className={labelCls}>E-mail</label>
                                    <div className="h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center px-4 gap-2">
                                        <span className="text-sm font-medium text-slate-400 flex-1 truncate">{user?.email || "—"}</span>
                                        <span className="text-[10px] font-bold text-slate-400 bg-slate-200 px-2 py-0.5 rounded-full uppercase tracking-wide shrink-0">fixo</span>
                                    </div>
                                </div>
                                <div>
                                    <label className={labelCls}>Telefone</label>
                                    <div className="relative">
                                        <Input value={phone} onChange={(e) => setPhone(formatPhone(e.target.value))} disabled={isSaving || isVerifyingPhone}
                                            placeholder="(00) 00000-0000"
                                            className={`${inputCls} pr-32 ${isVerifyingPhone ? "opacity-50" : ""}`} />
                                        {phoneModified && !isVerifyingPhone && (
                                            <Button onClick={requestPhoneChange} disabled={isSendingCode}
                                                className="absolute right-1.5 top-1/2 -translate-y-1/2 h-9 px-3 rounded-xl text-xs font-bold bg-indigo-600 text-white shadow-none hover:bg-indigo-700">
                                                {isSendingCode ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Enviar Código"}
                                            </Button>
                                        )}
                                    </div>
                                    {isVerifyingPhone && (
                                        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="mt-2 flex gap-2">
                                            <Input value={phoneCode} onChange={(e) => setPhoneCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                                placeholder="000000" className="h-11 rounded-xl flex-1 text-center font-black tracking-[0.5em] bg-slate-50 border-slate-200 text-slate-900" />
                                            <Button onClick={confirmPhoneChange} disabled={isSaving || phoneCode.length < 6}
                                                className="h-11 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs">
                                                {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Verificar"}
                                            </Button>
                                            <Button variant="ghost" onClick={() => setIsVerifyingPhone(false)} className="h-11 px-3 rounded-xl text-slate-400 text-xs">✕</Button>
                                        </motion.div>
                                    )}
                                </div>
                                <div className="flex items-start gap-3 bg-indigo-50 border border-indigo-100 rounded-2xl p-3">
                                    <Shield className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                                    <p className="text-[11px] text-indigo-700/80 leading-relaxed font-medium">
                                        Alteração de telefone exige confirmação via WhatsApp/SMS. O e-mail não pode ser alterado por aqui.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Save button — full width mobile, right-aligned desktop */}
                    <div className="flex justify-stretch lg:justify-end mt-3 lg:mt-4">
                        <Button onClick={handleSave} disabled={!isModified || isSaving}
                            className="w-full lg:w-auto lg:min-w-56 h-14 lg:h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-base lg:text-sm shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                            {isSaving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                            Salvar Alterações
                        </Button>
                    </div>
                </motion.div>
            )}

            {/* ── ASSINATURA ── */}
            {activeTab === "subscription" && (
                <motion.div key="subscription" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
                    {isLoading ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div className="h-52 bg-white rounded-[20px] animate-pulse shadow-sm" />
                            <div className="h-52 bg-white rounded-[20px] animate-pulse shadow-sm" />
                        </div>
                    ) : hasActiveSubscription ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
                            {/* Plan card */}
                            <div className="relative overflow-hidden rounded-[20px] shadow-sm">
                                <div className="bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-700 p-6 h-full">
                                    <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                                    <div className="relative flex flex-col h-full gap-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-3">
                                                <div className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                                                <span className="text-[10px] font-black text-emerald-300 uppercase tracking-widest">Ativo</span>
                                            </div>
                                            <h3 className="text-2xl font-black text-white tracking-tight uppercase leading-tight">{currentPlanLabel}</h3>
                                            <p className="text-sm font-semibold text-indigo-200 mt-1">{currentCourseLabel}</p>
                                            {currentPlanPrice && (
                                                <p className="text-lg font-black text-white mt-2">
                                                    {currentPlanPrice}
                                                    {currentBillingInterval && <span className="text-sm font-semibold text-indigo-300 ml-1">/ {currentBillingInterval}</span>}
                                                </p>
                                            )}
                                        </div>
                                        <Button onClick={() => setIsSubscriptionModalOpen(true)}
                                            className="w-full h-11 rounded-2xl bg-white text-indigo-700 hover:bg-indigo-50 font-bold active:scale-[0.98] transition-all shadow-none mt-auto">
                                            Gerenciar Assinatura
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Details card */}
                            <div className="flex flex-col gap-3">
                                {subscription && (
                                    <div className="bg-white rounded-[20px] p-5 shadow-sm border border-slate-100">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Próxima Renovação</p>
                                        <p className="text-2xl font-black text-slate-900">
                                            {new Date(subscription.currentPeriodEnd).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                                        </p>
                                        <p className="text-sm text-slate-500 font-medium">
                                            {new Date(subscription.currentPeriodEnd).toLocaleDateString("pt-BR", { year: "numeric" })}
                                        </p>
                                    </div>
                                )}
                                <div className="bg-white rounded-[20px] p-5 shadow-sm border border-slate-100 flex-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Faturamento</p>
                                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                        Para cancelar ou alterar seu plano, use o botão <b className="text-slate-700">Gerenciar Assinatura</b>. Em caso de dúvidas, acesse o{" "}
                                        <Link href="/faturamento" className="text-indigo-600 font-bold">histórico de faturamento</Link>.
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-[20px] p-8 shadow-sm border border-slate-100 text-center lg:max-w-md">
                            <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <CreditCard className="w-7 h-7 text-indigo-400" />
                            </div>
                            <h3 className="text-lg font-black text-slate-900 mb-1">Plano Gratuito</h3>
                            <p className="text-sm text-slate-500 font-medium leading-relaxed mb-5">Acesso limitado ao conteúdo básico e simulados públicos.</p>
                            <Link href="/pricing">
                                <Button className="w-full h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold active:scale-[0.98] transition-all shadow-none">Ver Planos</Button>
                            </Link>
                        </div>
                    )}
                </motion.div>
            )}

            {/* ── SESSÕES ── */}
            {activeTab === "security" && (
                <motion.div key="security" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-4">
                        {/* Device list — takes 2/3 on desktop */}
                        <div className="lg:col-span-2 space-y-3">
                            <div className="flex items-center justify-between px-0.5">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dispositivos conectados</span>
                                <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">{devices.length}</span>
                            </div>
                            <div className="bg-white rounded-[20px] overflow-hidden shadow-sm border border-slate-100 divide-y divide-slate-50">
                                {isLoading ? (
                                    [1, 2].map(i => (
                                        <div key={i} className="p-4 flex items-center gap-4">
                                            <div className="w-11 h-11 bg-slate-100 rounded-[14px] animate-pulse shrink-0" />
                                            <div className="flex-1 space-y-2">
                                                <div className="h-3.5 bg-slate-100 rounded animate-pulse w-2/3" />
                                                <div className="h-3 bg-slate-100 rounded animate-pulse w-1/2" />
                                            </div>
                                        </div>
                                    ))
                                ) : devices.length === 0 ? (
                                    <div className="py-12 text-center">
                                        <Monitor className="w-8 h-8 text-slate-200 mx-auto mb-3" />
                                        <p className="text-sm font-medium text-slate-400">Nenhum dispositivo encontrado.</p>
                                    </div>
                                ) : (
                                    devices.map(device => <DeviceRow key={device.id} device={device} />)
                                )}
                            </div>
                        </div>

                        {/* Security info — 1/3 on desktop */}
                        <div className="space-y-3">
                            <div className="bg-emerald-50 border border-emerald-100 rounded-[20px] p-5">
                                <div className="flex items-center gap-2 mb-3">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                    <p className="text-xs font-black text-emerald-800">Conta protegida</p>
                                </div>
                                <p className="text-[11px] text-emerald-700/70 leading-relaxed font-medium">
                                    Não reconheceu algum dispositivo? Remova-o e troque sua senha imediatamente.
                                </p>
                            </div>
                            <div className="bg-white border border-slate-100 rounded-[20px] p-5 shadow-sm">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Limite de sessões</p>
                                <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                                    Cada conta pode ter múltiplos dispositivos simultâneos. Remova sessões antigas para manter a segurança.
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    // ─── Shared avatar upload button overlay ─────────────────────────────────
    const AvatarOverlay = () => (
        <>
            {!avatarPreview ? (
                <label className="absolute -bottom-1.5 -right-1.5 w-8 h-8 bg-white rounded-xl flex items-center justify-center cursor-pointer shadow-lg shadow-indigo-900/30 active:scale-90 transition-transform z-10">
                    <Camera className="w-4 h-4 text-indigo-600" />
                    <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={isUploading} />
                </label>
            ) : (
                <div className="absolute -bottom-1.5 -right-1.5 flex gap-1 z-10">
                    <button onClick={confirmAvatarUpload} disabled={isUploading} className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg active:scale-90 transition-transform">
                        <CheckCircle2 className="w-4 h-4 text-white" />
                    </button>
                    <button onClick={cancelAvatarPreview} className="w-8 h-8 bg-red-400 rounded-xl flex items-center justify-center shadow-lg active:scale-90 transition-transform">
                        <span className="text-white text-xs font-black">✕</span>
                    </button>
                </div>
            )}
        </>
    );

    return (
        <div className="min-h-full">

            {/* ═══════════════════════════════════════════════════
                MOBILE LAYOUT  (hidden on lg+)
            ═══════════════════════════════════════════════════ */}
            <div className="lg:hidden flex flex-col min-h-full bg-slate-50">
                {/* Hero gradient header */}
                <div className="relative bg-gradient-to-b from-indigo-700 via-indigo-600 to-indigo-500 px-5 pt-8 pb-0 overflow-hidden">
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute -top-16 -right-16 w-64 h-64 bg-violet-400/20 rounded-full blur-3xl" />
                    </div>
                    <div className="relative flex flex-col items-center text-center pb-6">
                        <div className="relative mb-4">
                            <AvatarImage size="md" />
                            <AvatarOverlay />
                        </div>
                        {isLoading ? (
                            <div className="space-y-2">
                                <div className="h-7 w-48 bg-white/20 rounded-xl animate-pulse" />
                                <div className="h-4 w-28 bg-white/10 rounded-xl animate-pulse" />
                            </div>
                        ) : (
                            <>
                                <h1 className="text-[22px] font-black text-white tracking-tight">{user?.name || "Carregando..."}</h1>
                                {user?.nickname && <p className="text-sm font-semibold text-indigo-200 mt-0.5">@{user.nickname}</p>}
                            </>
                        )}
                        <div className="mt-3 flex items-center gap-2 bg-white/15 border border-white/20 rounded-full px-4 py-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                            <span className="text-xs font-bold text-white/90 uppercase tracking-wider">
                                {isLoading ? "..." : (hasActiveSubscription ? currentPlanLabel : "Plano Gratuito")}
                            </span>
                        </div>
                        {avatarPreview && !isUploading && (
                            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-3 flex gap-2">
                                <button onClick={confirmAvatarUpload} className="px-4 py-1.5 bg-white text-indigo-700 text-xs font-bold rounded-full">Confirmar Foto</button>
                                <button onClick={cancelAvatarPreview} className="px-4 py-1.5 bg-white/20 text-white text-xs font-bold rounded-full">Cancelar</button>
                            </motion.div>
                        )}
                    </div>
                    {/* Horizontal tabs */}
                    <div className="flex gap-1 bg-black/20 backdrop-blur-sm rounded-t-2xl p-1.5">
                        {TABS.map((tab) => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-[14px] text-xs font-bold transition-all active:scale-95 ${activeTab === tab.id ? "bg-white text-indigo-700 shadow-sm" : "text-white/60 hover:text-white/80"}`}>
                                <tab.icon className="w-3.5 h-3.5" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
                {/* Content */}
                <div className="flex-1 px-4 pt-5 pb-10 space-y-3">
                    <TabContent />
                    <button onClick={logout} className="w-full py-4 rounded-2xl bg-red-50 border border-red-100 text-red-500 font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all hover:bg-red-100/60 mt-1">
                        <LogOut className="w-4 h-4" />
                        Sair da Conta
                    </button>
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════
                DESKTOP LAYOUT  (hidden below lg)
            ═══════════════════════════════════════════════════ */}
            <div className="hidden lg:flex min-h-[calc(100vh-4rem)]">

                {/* Left sidebar */}
                <aside className="w-72 xl:w-80 shrink-0 border-r border-slate-100 bg-white flex flex-col">
                    {/* Profile card */}
                    <div className="p-6 border-b border-slate-100">
                        <div className="flex items-center gap-4">
                            {/* Avatar */}
                            <div className="relative shrink-0">
                                <Avatar
                                    src={avatarPreview || (user?.avatarUrl ? getAvatarUrl(user.avatarUrl as string) : undefined)}
                                    name={user?.name || ""}
                                    size="md"
                                    rankLevel={user?.level}
                                    activeAura={user?.activeAura}
                                    activeBorder={user?.activeBorder}
                                    auraMetadata={user?.auraMetadata}
                                    borderMetadata={user?.borderMetadata}
                                    className="ring-2 ring-indigo-100 shadow-md !rounded-[18px]"
                                />
                                {isUploading && (
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-[18px] z-10">
                                        <Loader2 className="w-5 h-5 text-white animate-spin" />
                                    </div>
                                )}
                                <label className="absolute -bottom-1 -right-1 w-6 h-6 bg-indigo-600 rounded-lg flex items-center justify-center cursor-pointer shadow-sm hover:bg-indigo-700 transition-colors active:scale-90 z-20">
                                    <Camera className="w-3 h-3 text-white" />
                                    <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={isUploading} />
                                </label>
                            </div>
                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                {isLoading ? (
                                    <div className="space-y-1.5">
                                        <div className="h-4 bg-slate-100 rounded animate-pulse w-3/4" />
                                        <div className="h-3 bg-slate-100 rounded animate-pulse w-1/2" />
                                    </div>
                                ) : (
                                    <>
                                        <p className="font-black text-slate-900 text-sm truncate leading-tight">{user?.name || "..."}</p>
                                        {user?.nickname && <p className="text-xs font-semibold text-indigo-500 truncate">@{user.nickname}</p>}
                                    </>
                                )}
                                <div className="flex items-center gap-1.5 mt-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate">
                                        {isLoading ? "..." : (hasActiveSubscription ? currentPlanLabel : "Gratuito")}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Avatar preview actions (desktop) */}
                        {avatarPreview && !isUploading && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-3 flex gap-2">
                                <button onClick={confirmAvatarUpload} className="flex-1 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-colors">
                                    Confirmar Foto
                                </button>
                                <button onClick={cancelAvatarPreview} className="flex-1 py-2 bg-slate-100 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-200 transition-colors">
                                    Cancelar
                                </button>
                            </motion.div>
                        )}
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-3 space-y-0.5">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 pt-2 pb-2">Configurações da Conta</p>
                        {TABS.map((tab) => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-3 px-3 py-3 rounded-xl w-full font-semibold text-sm transition-all active:scale-[0.98] ${activeTab === tab.id
                                    ? "bg-indigo-50 text-indigo-700"
                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                    }`}>
                                <div className={`w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0 transition-colors ${activeTab === tab.id ? "bg-indigo-100" : "bg-slate-100"}`}>
                                    <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? "text-indigo-600" : "text-slate-500"}`} />
                                </div>
                                <span className="text-[13px]">{tab.desktopLabel}</span>
                                {activeTab === tab.id && (
                                    <div className="ml-auto w-1.5 h-5 bg-indigo-500 rounded-full" />
                                )}
                            </button>
                        ))}
                    </nav>

                </aside>

                {/* Content area */}
                <main className="flex-1 bg-slate-50 p-8 xl:p-10 overflow-auto">
                    <div className="space-y-2">
                        {/* Section heading */}
                        <div className="mb-6">
                            <h2 className="text-xl font-black text-slate-900">
                                {TABS.find(t => t.id === activeTab)?.desktopLabel}
                            </h2>
                            <p className="text-sm text-slate-500 mt-0.5">
                                {activeTab === "profile" && "Gerencie seu nome, nickname e informações de contato."}
                                {activeTab === "subscription" && "Seu plano ativo e detalhes de cobrança."}
                                {activeTab === "security" && "Dispositivos com acesso à sua conta."}
                            </p>
                        </div>
                        <TabContent />
                    </div>
                </main>
            </div>

            <SubscriptionManagementModal open={isSubscriptionModalOpen} onOpenChange={setIsSubscriptionModalOpen} />
        </div>
    );
}
