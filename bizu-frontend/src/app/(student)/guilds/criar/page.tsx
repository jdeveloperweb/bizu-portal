"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Globe, Lock, Search, X, Check,
  ChevronRight, Info, Sparkles, Coins,
} from "lucide-react";
import { GuildBadge, GuildBadgeSelector, GuildBadgeType, GUILD_BADGES } from "@/components/guilds/GuildBadge";
import { GuildService } from "@/lib/guildService";
import { useAuth } from "@/components/AuthProvider";
import { useNotification } from "@/components/NotificationProvider";

// ─── Steps ────────────────────────────────────────────────────────────────────

const STEPS = ["Identidade", "Privacidade", "Convidar", "Confirmar"] as const;
type Step = 0 | 1 | 2 | 3;

// ─── UserChip ─────────────────────────────────────────────────────────────────

interface InviteUser {
  id: string;
  name: string;
  nickname: string;
  level: number;
}

function UserChip({ user, onRemove }: { user: InviteUser; onRemove: () => void }) {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-sm"
    >
      <div className="w-5 h-5 rounded-full bg-[#6366f1] flex items-center justify-center text-[10px] font-bold text-white">
        {user.name.charAt(0)}
      </div>
      <span className="text-indigo-900 font-bold">@{user.nickname}</span>
      <button onClick={onRemove} className="text-indigo-400 hover:text-indigo-700 transition-colors ml-1">
        <X size={12} />
      </button>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CriarGuildPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { notify } = useNotification();

  const [step, setStep] = useState<Step>(0);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedBadge, setSelectedBadge] = useState<GuildBadgeType>("espada");
  const [isPublic, setIsPublic] = useState(true);
  const [maxMembers, setMaxMembers] = useState(20);

  // Invite state
  const [inviteSearch, setInviteSearch] = useState("");
  const [invitedUsers, setInvitedUsers] = useState<InviteUser[]>([]);
  const [searchResults, setSearchResults] = useState<InviteUser[]>([]);
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const [submitting, setSubmitting] = useState(false);
  const [createdId, setCreatedId] = useState<string | null>(null);

  const selectedBadgeConfig = GUILD_BADGES.find(b => b.id === selectedBadge)!;

  // ── User search (debounced) ──
  const searchUsers = useCallback(async (q: string) => {
    if (q.length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    setSearching(true);
    try {
      const results = await GuildService.searchUsers(q);
      const filtered = results.filter(u => !invitedUsers.find(i => i.id === u.id));
      setSearchResults(filtered.slice(0, 6));
      setShowDropdown(filtered.length > 0);
    } catch {
      setSearchResults([]);
      setShowDropdown(false);
    } finally {
      setSearching(false);
    }
  }, [invitedUsers]);

  useEffect(() => {
    const t = setTimeout(() => searchUsers(inviteSearch), 350);
    return () => clearTimeout(t);
  }, [inviteSearch, searchUsers]);

  // ── Click outside ──
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function inviteUser(u: InviteUser) {
    setInvitedUsers(p => [...p, u]);
    setInviteSearch("");
    setShowDropdown(false);
  }

  function removeUser(id: string) {
    setInvitedUsers(p => p.filter(u => u.id !== id));
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const guild = await GuildService.createGuild({
        name: name.trim(),
        description: description.trim(),
        badge: selectedBadge,
        isPublic,
        maxMembers,
        invitedUserIds: invitedUsers.map(u => u.id),
      });
      setCreatedId(guild.id);
      notify("Guild criada!", `"${guild.name}" está pronta. Bem-vindo, fundador!`, "achievement");
      setTimeout(() => router.push(`/guilds/${guild.id}`), 1400);
    } catch (err: any) {
      notify("Erro", err.message ?? "Não foi possível criar a guild.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  const canAdvance = [
    name.trim().length >= 3 && description.trim().length >= 10,
    true,
    true,
    true,
  ][step];

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen p-6 lg:p-10 bg-[#f8fafc]">
      <div className="max-w-4xl mx-auto">

        {/* Back */}
        <button
          onClick={() => router.push("/guilds")}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 text-sm mb-10 transition-colors group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Voltar para Guilds
        </button>

        {/* Title */}
        {/* Title & Subtitle */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-slate-900 text-2xl font-bold">Criar Nova Guild</h1>
            <div className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
              PLANEJAMENTO
            </div>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-slate-500 text-sm">Monte seu grupo de estudos e lidere o ranking.</p>
            <span className="flex items-center gap-1.5 text-amber-600 font-bold ml-2 text-sm">
              <Sparkles size={14} /> Custa 5.000 Axons
            </span>
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-between mb-12 relative px-4">
          {/* Connector Line */}
          <div className="absolute top-[18px] left-10 right-10 h-[1px] bg-slate-200 -z-10" />

          {STEPS.map((label, i) => (
            <div key={label} className="flex flex-col items-center gap-2">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${i <= step
                  ? "bg-[#6366f1] text-white shadow-lg shadow-indigo-600/20"
                  : "bg-white border border-slate-200 text-slate-400"
                  }`}
              >
                {i < step ? <Check size={18} /> : i + 1}
              </div>
              <span className={`text-[10px] font-bold transition-colors uppercase tracking-tight ${i === step ? "text-[#6366f1]" : "text-slate-400"}`}>
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* ── Step content ── */}
        <AnimatePresence mode="wait">

          {/* Step 0 – Identidade */}
          {step === 0 && (
            <motion.div key="s0" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-10">
              <div>
                <label className="block text-lg font-bold text-slate-800 mb-6">Escolha a Insígnia</label>
                <GuildBadgeSelector value={selectedBadge} onChange={setSelectedBadge} />
                <div className="mt-6 flex items-center gap-2">
                  <Sparkles size={16} className="text-[#6366f1]" />
                  <span className="text-[#6366f1] font-bold">{selectedBadgeConfig.name}</span>
                  <span className="text-slate-500"> — {selectedBadgeConfig.description}</span>
                </div>
              </div>

              {/* Live preview - Design System Card */}
              <div className="bg-white rounded-2xl p-8 border border-slate-200 flex items-center gap-8 shadow-sm">
                <GuildBadge type={selectedBadge} size="xl" showGlow={false} />
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-slate-900 mb-1">{name || "Nome da Guild"}</h3>
                  <p className="text-slate-500 text-sm overflow-hidden text-ellipsis line-clamp-2">
                    {description || "Descrição da guild..."}
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-wide">
                    Nome da Guild <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      value={name}
                      onChange={e => setName(e.target.value)}
                      maxLength={40}
                      placeholder="Ex: Espadas do Saber"
                      className="w-full px-5 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                    />
                    <div className="absolute right-4 bottom-[-22px] text-right text-[10px] text-slate-400 font-medium">{name.length}/40</div>
                  </div>
                </div>

                <div className="pt-4">
                  <label className="block text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-wide">
                    Descrição <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <textarea
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      maxLength={200}
                      rows={4}
                      placeholder="Descreva o foco e objetivos da sua guild..."
                      className="w-full px-5 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all resize-none"
                    />
                    <div className="absolute right-4 bottom-[-22px] text-right text-[10px] text-slate-400 font-medium">{description.length}/200</div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 1 – Privacidade */}
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-10">
              <div>
                <label className="block text-lg font-bold text-slate-800 mb-6">Tipo de Guild</label>
                <div className="grid grid-cols-2 gap-6">
                  {[
                    { value: true, icon: Globe, title: "Pública", desc: "Qualquer usuário pode entrar ou pedir para participar." },
                    { value: false, icon: Lock, title: "Fechada", desc: "Somente por convite. Pedidos precisam de aprovação do admin." },
                  ].map(opt => {
                    const Icon = opt.icon;
                    const active = isPublic === opt.value;
                    return (
                      <button
                        key={String(opt.value)}
                        onClick={() => setIsPublic(opt.value)}
                        className={`relative p-8 rounded-2xl border text-left transition-all duration-300 ${active ? "border-indigo-500 bg-indigo-50/50 shadow-sm"
                          : "border-slate-200 bg-white hover:border-slate-300"
                          }`}
                      >
                        {active && (
                          <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center">
                            <Check size={14} className="text-white" />
                          </div>
                        )}
                        <Icon size={28} className={`${active ? "text-indigo-600" : "text-slate-400"} mb-4`} />
                        <div className={`font-bold text-lg mb-1 ${active ? "text-indigo-900" : "text-slate-900"}`}>{opt.title}</div>
                        <div className="text-sm text-slate-500 leading-relaxed">{opt.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                <label className="block text-slate-800 font-bold mb-6">
                  Limite de membros — <span className="text-indigo-600 text-xl">{maxMembers}</span>
                </label>
                <input
                  type="range" min={5} max={100} step={5}
                  value={maxMembers}
                  onChange={e => setMaxMembers(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-4 font-bold uppercase tracking-wider">
                  <span>5 membros</span><span>100 membros</span>
                </div>
              </div>

              <div className="flex gap-4 p-5 rounded-2xl bg-indigo-50 border border-indigo-100 items-center">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                  <Info size={20} />
                </div>
                <p className="text-sm text-indigo-900/80 leading-relaxed">
                  Você será automaticamente o <span className="text-indigo-600 font-bold">Fundador</span>.
                  A criação consome <span className="text-amber-700 font-bold">5.000 Axons</span> do seu saldo.
                </p>
              </div>
            </motion.div>
          )}

          {/* Step 2 – Convidar */}
          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-10">
              <div>
                <label className="block text-lg font-bold text-slate-800 mb-2">Convidar Membros</label>
                <p className="text-slate-500 text-sm mb-6">
                  Comece sua jornada com aliados. Os convidados serão notificados imediatamente.
                </p>

                {invitedUsers.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <AnimatePresence>
                      {invitedUsers.map(u => (
                        <UserChip key={u.id} user={u} onRemove={() => removeUser(u.id)} />
                      ))}
                    </AnimatePresence>
                  </div>
                )}

                <div ref={searchRef} className="relative">
                  <Search size={20} className={`absolute left-4 top-1/2 -translate-y-1/2 ${searching ? "text-indigo-600 animate-pulse" : "text-slate-400"}`} />
                  <input
                    value={inviteSearch}
                    onChange={e => setInviteSearch(e.target.value)}
                    placeholder="Buscar por nome ou @usuario..."
                    className="w-full pl-12 pr-5 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
                  />

                  <AnimatePresence>
                    {showDropdown && searchResults.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-0 right-0 mt-3 bg-white border border-slate-200 rounded-2xl overflow-hidden z-50 shadow-xl"
                      >
                        {searchResults.map(u => (
                          <button
                            key={u.id}
                            onClick={() => inviteUser(u)}
                            className="w-full flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors text-left group border-b border-slate-100 last:border-0"
                          >
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-bold text-indigo-700">
                              {u.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{u.name}</div>
                              <div className="text-xs text-slate-500 font-medium">@{u.nickname} · Nível {u.level}</div>
                            </div>
                            <div className="ml-auto flex items-center gap-1.5 text-xs font-bold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Check size={14} /> ADICIONAR
                            </div>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3 – Confirmar */}
          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
              <h2 className="text-lg font-bold text-slate-800">Quase lá! Confira os detalhes de sua futura Guild.</h2>

              <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="flex items-center gap-10 relative z-10">
                  <GuildBadge type={selectedBadge} size="xl" showGlow={false} />
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl font-bold text-slate-900">{name}</h3>
                      <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${isPublic ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                        {isPublic ? 'Pública' : 'Privada'}
                      </div>
                    </div>
                    <p className="text-slate-500 text-sm mb-6 leading-relaxed">{description}</p>
                    <div className="flex items-center gap-6">
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Capacidade</span>
                        <span className="text-slate-900 font-bold">{maxMembers} Membros</span>
                      </div>
                      <div className="w-px h-8 bg-slate-100" />
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Insígnia</span>
                        <span className="text-indigo-600 font-bold">{selectedBadgeConfig.name}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-6 rounded-2xl bg-amber-50 border border-amber-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
                    <Sparkles size={24} />
                  </div>
                  <div>
                    <div className="text-slate-900 font-bold">Investimento de Fundação</div>
                    <div className="text-slate-500 text-sm">A taxa será deduzida após a confirmação.</div>
                  </div>
                </div>
                <div className="text-2xl font-black text-amber-700">5.000 AXONS</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-12 pt-8 border-t border-slate-100">
          <button
            onClick={() => step > 0 ? setStep(s => (s - 1) as Step) : router.push("/guilds")}
            className="px-8 py-3 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all font-bold"
          >
            {step === 0 ? "Cancelar" : "Voltar"}
          </button>

          {step < 3 ? (
            <button
              onClick={() => canAdvance && setStep(s => (s + 1) as Step)}
              disabled={!canAdvance}
              className={`flex items-center gap-2 px-10 py-3 rounded-xl text-sm font-bold transition-all ${canAdvance
                ? "bg-[#6366f1] hover:bg-[#4f46e5] text-white shadow-lg shadow-indigo-600/20 active:scale-95"
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
                }`}
            >
              PRÓXIMO PASSO <ChevronRight size={18} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting || !!createdId}
              className="group relative flex items-center gap-2 px-12 py-3 rounded-xl bg-[#6366f1] hover:bg-[#4f46e5] text-white text-sm font-bold transition-all shadow-lg shadow-indigo-600/30 disabled:opacity-60 disabled:cursor-not-allowed overflow-hidden"
            >
              {submitting ? (
                <>
                  <span className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                  CRIANDO GUILD...
                </>
              ) : (
                <>
                  CONFIRMAR E CRIAR <Sparkles size={18} />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
