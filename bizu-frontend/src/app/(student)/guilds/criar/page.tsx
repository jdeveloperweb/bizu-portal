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
      className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-sm"
    >
      <div className="w-5 h-5 rounded-full bg-indigo-700 flex items-center justify-center text-[10px] font-bold text-white">
        {user.name.charAt(0)}
      </div>
      <span className="text-indigo-200 font-medium">@{user.nickname}</span>
      <button onClick={onRemove} className="text-indigo-400 hover:text-white transition-colors ml-1">
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
    <div className="min-h-screen p-6 lg:p-10">
      <div className="max-w-2xl mx-auto">

        {/* Back */}
        <button
          onClick={() => router.push("/guilds")}
          className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-8 transition-colors group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Voltar para Guilds
        </button>

        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white mb-1">Criar Nova Guild</h1>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <p>Monte seu grupo de estudos e lidere o ranking.</p>
            <span className="flex items-center gap-1 text-yellow-400 font-semibold">
              <Coins size={13} /> Custa 5.000 Axons
            </span>
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-0 mb-10">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center flex-1">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    i < step
                      ? "bg-indigo-600 text-white"
                      : i === step
                      ? "bg-indigo-600 text-white ring-4 ring-indigo-600/30"
                      : "bg-slate-800 text-slate-500"
                  }`}
                >
                  {i < step ? <Check size={14} /> : i + 1}
                </div>
                <span className={`text-[10px] font-medium ${i === step ? "text-indigo-400" : "text-slate-600"}`}>
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-px mx-3 mt-[-12px] transition-colors ${i < step ? "bg-indigo-600" : "bg-slate-800"}`}
                />
              )}
            </div>
          ))}
        </div>

        {/* ── Step content ── */}
        <AnimatePresence mode="wait">

          {/* Step 0 – Identidade */}
          {step === 0 && (
            <motion.div key="s0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-4">Escolha a Insígnia</label>
                <GuildBadgeSelector value={selectedBadge} onChange={setSelectedBadge} />
                <p className="mt-3 text-xs text-slate-500 flex items-center gap-1.5">
                  <Sparkles size={11} className="text-indigo-400" />
                  <span className="text-indigo-300 font-medium">{selectedBadgeConfig.name}</span> — {selectedBadgeConfig.description}
                </p>
              </div>

              {/* Live preview */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <GuildBadge type={selectedBadge} size="lg" showGlow />
                <div>
                  <div className="text-white font-bold">{name || "Nome da Guild"}</div>
                  <div className="text-slate-500 text-sm">{description || "Descrição da guild..."}</div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Nome da Guild <span className="text-red-400">*</span>
                </label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  maxLength={40}
                  placeholder="Ex: Espadas do Saber"
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/60 transition-colors text-sm"
                />
                <div className="mt-1 text-right text-[11px] text-slate-600">{name.length}/40</div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Descrição <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  maxLength={200}
                  rows={3}
                  placeholder="Descreva o foco e objetivos da sua guild..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/60 transition-colors text-sm resize-none"
                />
                <div className="mt-1 text-right text-[11px] text-slate-600">{description.length}/200</div>
              </div>
            </motion.div>
          )}

          {/* Step 1 – Privacidade */}
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-4">Tipo de Guild</label>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { value: true,  icon: Globe, title: "Pública",  desc: "Qualquer usuário pode entrar ou pedir para participar." },
                    { value: false, icon: Lock,  title: "Fechada", desc: "Somente por convite. Pedidos precisam de aprovação do admin." },
                  ].map(opt => {
                    const Icon = opt.icon;
                    const active = isPublic === opt.value;
                    return (
                      <button
                        key={String(opt.value)}
                        onClick={() => setIsPublic(opt.value)}
                        className={`relative p-5 rounded-2xl border text-left transition-all duration-200 ${
                          active ? "border-indigo-500/60 bg-indigo-600/10 shadow-[0_0_20px_rgba(99,102,241,0.1)]"
                                 : "border-slate-800 bg-slate-900 hover:border-slate-700"
                        }`}
                      >
                        {active && (
                          <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center">
                            <Check size={11} className="text-white" />
                          </div>
                        )}
                        <Icon size={24} className={`${active ? "text-indigo-400" : "text-slate-500"} mb-3`} />
                        <div className="font-bold text-white mb-1">{opt.title}</div>
                        <div className="text-xs text-slate-500">{opt.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Limite de membros — <span className="text-indigo-400 font-bold">{maxMembers}</span>
                </label>
                <input
                  type="range" min={5} max={50} step={5}
                  value={maxMembers}
                  onChange={e => setMaxMembers(Number(e.target.value))}
                  className="w-full accent-indigo-500"
                />
                <div className="flex justify-between text-[11px] text-slate-600 mt-1">
                  <span>5 membros</span><span>50 membros</span>
                </div>
              </div>

              <div className="flex gap-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <Info size={16} className="text-indigo-400 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-400 leading-relaxed">
                  Você será automaticamente o <span className="text-white font-semibold">Fundador</span> e terá
                  permissões de administrador. A criação custa{" "}
                  <span className="text-yellow-400 font-semibold">5.000 Axons</span>.
                </p>
              </div>
            </motion.div>
          )}

          {/* Step 2 – Convidar */}
          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1">
                  Convidar Membros
                  <span className="ml-2 text-slate-500 font-normal text-xs">(opcional)</span>
                </label>
                <p className="text-xs text-slate-500 mb-4">
                  Os convidados receberão uma notificação e poderão aceitar ou recusar.
                </p>

                {invitedUsers.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    <AnimatePresence>
                      {invitedUsers.map(u => (
                        <UserChip key={u.id} user={u} onRemove={() => removeUser(u.id)} />
                      ))}
                    </AnimatePresence>
                  </div>
                )}

                <div ref={searchRef} className="relative">
                  <Search size={15} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${searching ? "text-indigo-400 animate-pulse" : "text-slate-500"}`} />
                  <input
                    value={inviteSearch}
                    onChange={e => setInviteSearch(e.target.value)}
                    placeholder="Buscar por nome ou @usuario..."
                    className="w-full pl-9 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/60 transition-colors text-sm"
                  />

                  <AnimatePresence>
                    {showDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden z-50 shadow-2xl"
                      >
                        {searchResults.map(u => (
                          <button
                            key={u.id}
                            onClick={() => inviteUser(u)}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-800 transition-colors text-left"
                          >
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center text-sm font-bold text-white shrink-0">
                              {u.name.charAt(0)}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-white">{u.name}</div>
                              <div className="text-xs text-slate-500">@{u.nickname} · Nível {u.level}</div>
                            </div>
                            <div className="ml-auto text-xs text-indigo-400">Convidar</div>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {invitedUsers.length > 0 && (
                  <p className="mt-3 text-xs text-slate-500">
                    <span className="text-indigo-400 font-semibold">{invitedUsers.length}</span> usuário(s) serão convidados após a criação.
                  </p>
                )}
              </div>
            </motion.div>
          )}

          {/* Step 3 – Confirmar */}
          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
              <h2 className="text-lg font-bold text-white">Resumo da Guild</h2>

              {/* Preview card */}
              <div
                className="relative rounded-2xl overflow-hidden border border-slate-700 p-6"
                style={{ background: `linear-gradient(135deg, ${selectedBadgeConfig.glow}15, #0F172A)` }}
              >
                <div className="flex items-start gap-5">
                  <GuildBadge type={selectedBadge} size="xl" showGlow />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl font-black text-white">{name}</h3>
                      {isPublic ? <Globe size={14} className="text-green-400" /> : <Lock size={14} className="text-orange-400" />}
                    </div>
                    <p className="text-sm text-slate-400 mb-4">{description}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span>Até {maxMembers} membros</span>
                      <span className="text-indigo-400">{selectedBadgeConfig.name}</span>
                    </div>
                  </div>
                </div>
              </div>

              {invitedUsers.length > 0 && (
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="text-sm font-semibold text-slate-300 mb-3">{invitedUsers.length} convite(s) serão enviados</div>
                  <div className="space-y-2">
                    {invitedUsers.map(u => (
                      <div key={u.id} className="flex items-center gap-2 text-sm text-slate-400">
                        <div className="w-6 h-6 rounded-full bg-indigo-700 flex items-center justify-center text-[10px] font-bold text-white">
                          {u.name.charAt(0)}
                        </div>
                        @{u.nickname}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Axon cost warning */}
              <div className="flex gap-3 p-4 rounded-xl bg-yellow-950/30 border border-yellow-500/20">
                <Coins size={16} className="text-yellow-400 shrink-0 mt-0.5" />
                <p className="text-xs text-yellow-200/80 leading-relaxed">
                  Confirmar criará a guild e deduzirá{" "}
                  <span className="text-yellow-400 font-bold">5.000 Axons</span> do seu saldo.
                </p>
              </div>

              {createdId && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex items-center gap-3 p-4 rounded-xl bg-green-600/10 border border-green-500/30"
                >
                  <Check size={18} className="text-green-400" />
                  <span className="text-green-300 text-sm font-medium">Guild criada! Redirecionando...</span>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-10 pt-6 border-t border-slate-800">
          <button
            onClick={() => step > 0 ? setStep(s => (s - 1) as Step) : router.push("/guilds")}
            className="px-5 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 text-sm font-medium transition-colors"
          >
            {step === 0 ? "Cancelar" : "Voltar"}
          </button>

          {step < 3 ? (
            <button
              onClick={() => canAdvance && setStep(s => (s + 1) as Step)}
              disabled={!canAdvance}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                canAdvance
                  ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25"
                  : "bg-slate-800 text-slate-600 cursor-not-allowed"
              }`}
            >
              Próximo <ChevronRight size={15} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting || !!createdId}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all shadow-lg shadow-indigo-600/25 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  <Sparkles size={15} /> Criar Guild
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
