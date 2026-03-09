"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Users, Zap, Trophy, Crown, Flame,
  Shield, Lock, Globe, Settings, UserPlus,
  MessageSquare, BookOpen, Layers, Target,
  Check, MoreVertical, ChevronRight, ChevronLeft,
  Upload, FileText, Video, Link2, Clock, Award,
  Bell, Calendar, Send, PenLine,
  CheckSquare, RotateCcw, Eye, EyeOff,
  ListTodo, StickyNote, ShieldCheck, ShieldOff, UserMinus, X
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { GuildBadge, GuildBadgeSelector, GuildBadgeType, GUILD_BADGES } from "@/components/guilds/GuildBadge";
import {
  GuildService,
  GuildResponseDTO,
  GuildMemberDTO,
  GuildRequestDTO,
  GuildMaterialDTO,
  GuildMissionDTO,
  GuildActivityDTO,
  GuildMessageDTO,
  GuildNoteDTO,
  GuildTaskDTO,
  GuildFlashcardDeckDTO,
  GuildFlashcardDTO,
} from "@/lib/guildService";
import { useNotification } from "@/components/NotificationProvider";
import { useAuth } from "@/components/AuthProvider";
import { Skeleton } from "@/components/ui/skeleton";

// ─── Types ────────────────────────────────────────────────────────────────────

type GuildTab = "inicio" | "membros" | "materiais" | "flashcards" | "anotacoes" | "tarefas" | "ranking" | "missoes";

// ─── Settings Modal ───────────────────────────────────────────────────────────

function SettingsModal({
  guild, onClose, onUpdate, onDelete
}: {
  guild: GuildResponseDTO;
  onClose: () => void;
  onUpdate: (data: Partial<GuildResponseDTO>) => Promise<void>;
  onDelete: () => Promise<void>;
}) {
  const [name, setName] = useState(guild.name);
  const [description, setDescription] = useState(guild.description);
  const [badge, setBadge] = useState<GuildBadgeType>(guild.badge as GuildBadgeType);
  const [isPublic, setIsPublic] = useState(guild.isPublic);
  const [weeklyGoal, setWeeklyGoal] = useState(guild.weeklyGoal);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await onUpdate({
        name: name.trim(),
        description: description.trim(),
        badge,
        isPublic,
        weeklyGoal
      });
      onClose();
    } catch {
      // notification handled by parent
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl"
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings size={18} className="text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900">Configurações da Guild</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 transition-colors">
            <X size={18} className="text-slate-400" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Insígnia</label>
            <GuildBadgeSelector value={badge} onChange={setBadge} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Nome</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                maxLength={40}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium text-sm text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Meta Semanal (XP)</label>
              <input
                type="number"
                value={weeklyGoal}
                onChange={e => setWeeklyGoal(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium text-sm text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Descrição</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              maxLength={200}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium text-sm text-slate-900 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Privacidade</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setIsPublic(true)}
                className={`p-4 rounded-xl border text-left transition-all ${isPublic ? "border-indigo-500 bg-indigo-50" : "border-slate-200 hover:border-slate-300"}`}
              >
                <div className={`font-bold text-sm mb-1 flex items-center gap-2 ${isPublic ? "text-indigo-900" : "text-slate-900"}`}>
                  <Globe size={14} className={isPublic ? "text-indigo-600" : "text-slate-400"} /> Pública
                </div>
                <div className="text-[10px] text-slate-500 leading-tight">Sugestão de entrada livre ou por pedido.</div>
              </button>
              <button
                onClick={() => setIsPublic(false)}
                className={`p-4 rounded-xl border text-left transition-all ${!isPublic ? "border-indigo-500 bg-indigo-50" : "border-slate-200 hover:border-slate-300"}`}
              >
                <div className={`font-bold text-sm mb-1 flex items-center gap-2 ${!isPublic ? "text-indigo-900" : "text-slate-900"}`}>
                  <Lock size={14} className={!isPublic ? "text-indigo-600" : "text-slate-400"} /> Fechada
                </div>
                <div className="text-[10px] text-slate-500 leading-tight">Somente convidados podem entrar.</div>
              </button>
            </div>
          </div>

          {guild.isFounder && (
            <div className="pt-4 border-t border-slate-100">
              <button
                onClick={onDelete}
                className="flex items-center gap-2 text-xs font-bold text-red-500 hover:text-red-700 transition-colors"
                type="button"
              >
                <X size={14} /> Deletar permanentemente esta guilda
              </button>
            </div>
          )}
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-slate-500 font-bold text-sm hover:text-slate-900 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !name.trim()}
            className="px-8 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/20 active:scale-95 transition-all disabled:opacity-50"
          >
            {saving ? "Salvando..." : "Salvar Alterações"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function InviteModal({ guildId, onClose, onInvite }: { guildId: string; onClose: () => void; onInvite: (userId: string) => Promise<void> }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ id: string, name: string, nickname: string, level: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const [inviting, setInviting] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length < 3) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const data = await GuildService.searchUsers(query);
        setResults(data);
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  async function handleInvite(userId: string) {
    setInviting(userId);
    try {
      await onInvite(userId);
      setResults(prev => prev.filter(u => u.id !== userId));
    } finally {
      setInviting(null);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Convidar Membros</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 transition-colors"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="relative">
            <input
              placeholder="Digite o @nickname..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none text-sm transition-all"
            />
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {loading ? <div className="text-center py-4 text-xs text-slate-400">Buscando...</div> :
              results.length === 0 && query.length >= 3 ? <div className="text-center py-4 text-xs text-slate-400">Nenhum usuário encontrado.</div> :
                results.map(u => (
                  <div key={u.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <MemberAvatar name={u.name} size="sm" />
                      <div>
                        <div className="text-sm font-bold text-slate-800">{u.name}</div>
                        <div className="text-[10px] text-slate-500">@{u.nickname} · Nível {u.level}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleInvite(u.id)}
                      disabled={inviting === u.id}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all disabled:opacity-50"
                    >
                      {inviting === u.id ? "..." : "Convidar"}
                    </button>
                  </div>
                ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function UploadMaterialModal({ onClose, onUpload }: { onClose: () => void; onUpload: (file: File, title: string) => Promise<void> }) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [uploading, setUploading] = useState(false);

  async function handleUpload() {
    if (!file) return;
    setUploading(true);
    try {
      await onUpload(file, title);
      onClose();
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Compartilhar Material</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 transition-colors"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Título do Material (Opcional)</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ex: Resumo de Anatomia"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none text-sm transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Arquivo (PDF, Vídeo, etc)</label>
            <div className={`relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-all ${file ? "border-indigo-400 bg-indigo-50" : "border-slate-200 hover:border-slate-300"}`}>
              <Upload size={24} className={file ? "text-indigo-600" : "text-slate-300"} />
              <div className="mt-2 text-xs font-medium text-slate-600">
                {file ? file.name : "Arraste ou clique para selecionar"}
              </div>
              <input
                type="file"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={e => setFile(e.target.files?.[0] || null)}
              />
            </div>
          </div>
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50"
          >
            {uploading ? "Fazendo upload..." : "Compartilhar com a Guild"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

const TABS: { id: GuildTab; label: string; icon: React.ElementType }[] = [
  { id: "inicio", label: "Início", icon: Shield },
  { id: "membros", label: "Membros", icon: Users },
  { id: "materiais", label: "Materiais", icon: BookOpen },
  { id: "flashcards", label: "Flash Cards", icon: Layers },
  { id: "anotacoes", label: "Anotações", icon: StickyNote },
  { id: "tarefas", label: "Tarefas", icon: ListTodo },
  { id: "ranking", label: "Rankings", icon: Trophy },
  { id: "missoes", label: "Missões", icon: Target },
];

const leagueColors: Record<string, string> = {
  BRONZE: "#CD7F32", PRATA: "#C0C0C0", OURO: "#FFD700",
  DIAMANTE: "#B9F2FF", MESTRE: "#A855F7",
};

// ─── Shared sub-components ────────────────────────────────────────────────────

function MemberAvatar({ name, size = "md", online = false }: {
  name: string; size?: "sm" | "md" | "lg"; online?: boolean;
}) {
  const cls = { sm: "w-7 h-7 text-xs", md: "w-9 h-9 text-sm", lg: "w-12 h-12 text-base" }[size];
  return (
    <div className="relative shrink-0">
      <div className={`${cls} rounded-full bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center font-bold text-white`}>
        {name.charAt(0).toUpperCase()}
      </div>
      {online && (
        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
      )}
    </div>
  );
}

function XPBar({ value, max, color = "#6366F1", animated = true }: {
  value: number; max: number; color?: string; animated?: boolean;
}) {
  const pct = Math.min((value / Math.max(max, 1)) * 100, 100);
  return (
    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
      <motion.div
        initial={animated ? { width: 0 } : false}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="h-full rounded-full"
        style={{ background: color }}
      />
    </div>
  );
}

// ─── Tab: Início ─────────────────────────────────────────────────────────────

function InicioTab({
  guild, activity, members, missions, messages, onSendMessage,
}: {
  guild: GuildResponseDTO;
  activity: GuildActivityDTO[];
  members: GuildMemberDTO[];
  missions: GuildMissionDTO[];
  messages: GuildMessageDTO[];
  onSendMessage: (text: string) => void;
}) {
  const [chatInput, setChatInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activeMission = missions.find(m => !m.completed);
  const top3 = [...members].slice(0, 3);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSend() {
    const text = chatInput.trim();
    if (!text) return;
    onSendMessage(text);
    setChatInput("");
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left column */}
      <div className="lg:col-span-2 space-y-5">

        {/* Weekly goal */}
        <div className="p-5 rounded-xl bg-[var(--card)] border border-[var(--border)] shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                <Target size={14} className="text-indigo-600" />
              </div>
              <span className="font-semibold text-[var(--foreground)] text-sm">Meta Semanal</span>
            </div>
            <span className="text-xs text-[var(--muted-foreground)]">
              {guild.weeklyXp.toLocaleString("pt-BR")} / {guild.weeklyGoal.toLocaleString("pt-BR")} XP
            </span>
          </div>
          <XPBar value={guild.weeklyXp} max={guild.weeklyGoal} color="#6366F1" />
          <p className="mt-2 text-xs text-[var(--muted-foreground)]">
            Faltam{" "}
            <span className="text-indigo-600 font-semibold">
              {Math.max(0, guild.weeklyGoal - guild.weeklyXp).toLocaleString("pt-BR")} XP
            </span>{" "}
            para a meta desta semana
          </p>
        </div>

        {/* Podium */}
        {top3.length >= 1 && (
          <div className="p-5 rounded-xl bg-[var(--card)] border border-[var(--border)] shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center">
                <Crown size={14} className="text-amber-600" />
              </div>
              <span className="font-semibold text-[var(--foreground)] text-sm">Top Membros da Semana</span>
            </div>
            <div className="flex items-end justify-center gap-4">
              {/* 2nd */}
              {top3[1] && (
                <div className="flex flex-col items-center gap-2">
                  <MemberAvatar name={top3[1].name} size="md" online={top3[1].online} />
                  <div className="text-center">
                    <div className="text-xs font-semibold text-[var(--foreground)]">{top3[1].nickname}</div>
                    <div className="text-[10px] text-[var(--muted-foreground)]">{top3[1].xp.toLocaleString()} XP</div>
                  </div>
                  <div className="w-16 h-14 rounded-t-xl flex items-center justify-center bg-slate-100 border border-slate-200">
                    <span className="text-2xl font-black text-slate-500">2</span>
                  </div>
                </div>
              )}
              {/* 1st */}
              <div className="flex flex-col items-center gap-2">
                <div className="relative">
                  <MemberAvatar name={top3[0].name} size="lg" online={top3[0].online} />
                  <Crown size={14} className="absolute -top-3 left-1/2 -translate-x-1/2 text-amber-500" />
                </div>
                <div className="text-center">
                  <div className="text-xs font-semibold text-[var(--foreground)]">{top3[0].nickname}</div>
                  <div className="text-[10px] text-amber-600 font-semibold">{top3[0].xp.toLocaleString()} XP</div>
                </div>
                <div className="w-16 h-20 rounded-t-xl flex items-center justify-center bg-gradient-to-t from-amber-100 to-amber-50 border border-amber-200">
                  <span className="text-3xl font-black text-amber-500">1</span>
                </div>
              </div>
              {/* 3rd */}
              {top3[2] && (
                <div className="flex flex-col items-center gap-2">
                  <MemberAvatar name={top3[2].name} size="md" online={top3[2].online} />
                  <div className="text-center">
                    <div className="text-xs font-semibold text-[var(--foreground)]">{top3[2].nickname}</div>
                    <div className="text-[10px] text-[var(--muted-foreground)]">{top3[2].xp.toLocaleString()} XP</div>
                  </div>
                  <div className="w-16 h-10 rounded-t-xl flex items-center justify-center bg-slate-100 border border-slate-200">
                    <span className="text-xl font-black text-amber-700">3</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Activity feed */}
        <div className="p-5 rounded-xl bg-[var(--card)] border border-[var(--border)] shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center">
              <Zap size={14} className="text-amber-600" />
            </div>
            <span className="font-semibold text-[var(--foreground)] text-sm">Atividade Recente</span>
          </div>
          {activity.length === 0 ? (
            <p className="text-sm text-[var(--muted-foreground)] text-center py-4">Nenhuma atividade ainda.</p>
          ) : (
            <div className="space-y-0">
              {activity.map(a => (
                <div key={a.id} className="flex items-center gap-3 py-2.5 border-b border-[var(--border)] last:border-0">
                  <MemberAvatar name={a.user} size="sm" />
                  <div className="flex-1 text-xs">
                    <span className="text-[var(--foreground)] font-medium">{a.user}</span>
                    <span className="text-[var(--muted-foreground)]"> {a.action}</span>
                  </div>
                  {a.xp > 0 && (
                    <span className="text-[10px] text-amber-600 font-semibold">+{a.xp} XP</span>
                  )}
                  <span className="text-[10px] text-[var(--muted-foreground)]">{a.time}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right column */}
      <div className="space-y-5">

        {/* Active mission */}
        {activeMission && (
          <div className="p-5 rounded-xl bg-indigo-50 border border-indigo-100">
            <div className="flex items-center gap-2 mb-2">
              <Target size={13} className="text-indigo-600" />
              <span className="text-[10px] font-semibold text-indigo-600 uppercase tracking-wide">Missão Ativa</span>
            </div>
            <h4 className="font-bold text-[var(--foreground)] mb-1 text-sm">{activeMission.title}</h4>
            <p className="text-xs text-[var(--muted-foreground)] mb-3">{activeMission.description}</p>
            <XPBar value={activeMission.progress} max={activeMission.total} color="#6366F1" />
            <div className="flex justify-between mt-1.5 text-[11px] text-[var(--muted-foreground)]">
              <span>{activeMission.progress}/{activeMission.total}</span>
              {activeMission.endsAt && (
                <span className="flex items-center gap-1"><Clock size={10} /> {activeMission.endsAt}</span>
              )}
            </div>
            <div className="mt-3 text-xs text-amber-600 font-semibold flex items-center gap-1">
              <Award size={12} /> Recompensa: +{activeMission.xpReward} XP
            </div>
          </div>
        )}

        {/* Chat */}
        <div className="p-4 rounded-xl bg-[var(--card)] border border-[var(--border)] shadow-sm flex flex-col" style={{ height: 320 }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-md bg-indigo-50 border border-indigo-100 flex items-center justify-center">
              <MessageSquare size={12} className="text-indigo-600" />
            </div>
            <span className="text-xs font-semibold text-[var(--foreground)]">Chat da Guild</span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 mb-3 pr-1">
            {messages.length === 0 ? (
              <p className="text-xs text-[var(--muted-foreground)] text-center pt-4">Seja o primeiro a enviar uma mensagem!</p>
            ) : (
              messages.map(msg => (
                <div key={msg.id} className={`flex gap-2 ${msg.isMe ? "flex-row-reverse" : ""}`}>
                  {!msg.isMe && <MemberAvatar name={msg.user} size="sm" />}
                  <div className={`max-w-[80%] flex flex-col gap-0.5 ${msg.isMe ? "items-end" : "items-start"}`}>
                    {!msg.isMe && <span className="text-[10px] text-[var(--muted-foreground)]">{msg.user}</span>}
                    <div className={`px-3 py-2 rounded-xl text-xs leading-relaxed ${msg.isMe ? "bg-indigo-600 text-white" : "bg-[var(--muted)] text-[var(--foreground)]"}`}>
                      {msg.text}
                    </div>
                    <span className="text-[10px] text-[var(--muted-foreground)]">{msg.time}</span>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="flex gap-2">
            <input
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder="Mensagem..."
              className="flex-1 px-3 py-2 rounded-lg bg-[var(--input)] border border-[var(--border)] text-xs text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10 transition-all"
            />
            <button
              onClick={handleSend}
              disabled={!chatInput.trim()}
              className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs transition-colors"
            >
              <Send size={13} />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="p-4 rounded-xl bg-[var(--card)] border border-[var(--border)] shadow-sm grid grid-cols-2 gap-3">
          {[
            { label: "Membros", value: String(guild.memberCount), color: "text-[var(--foreground)]" },
            { label: "Streak", value: `${guild.streak}d`, color: "text-orange-500" },
            { label: "Ranking", value: `#${guild.rankPosition}`, color: "text-amber-600" },
            { label: "XP Total", value: `${(guild.totalXp / 1000).toFixed(0)}k`, color: "text-indigo-600" },
          ].map(s => (
            <div key={s.label} className="text-center p-3 rounded-xl bg-[var(--muted)]">
              <div className={`text-xl font-black ${s.color}`}>{s.value}</div>
              <div className="text-[10px] text-[var(--muted-foreground)]">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Member actions dropdown ──────────────────────────────────────────────────

function MemberActionsMenu({
  member, isFounder, onPromote, onDemote, onKick,
}: {
  member: GuildMemberDTO;
  isFounder: boolean;
  onPromote: () => void;
  onDemote: () => void;
  onKick: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const canManageAdmin = member.role === "admin" && isFounder;
  const canPromote = member.role === "member";
  const canKick = member.role !== "founder";

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="p-1.5 rounded-lg hover:bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
      >
        <MoreVertical size={14} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.1 }}
            className="absolute right-0 top-full mt-1 w-48 bg-white border border-[var(--border)] rounded-xl shadow-lg z-50 overflow-hidden py-1"
          >
            {canPromote && (
              <button
                onClick={() => { onPromote(); setOpen(false); }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[var(--foreground)] hover:bg-indigo-50 hover:text-indigo-700 transition-colors text-left"
              >
                <ShieldCheck size={14} className="text-indigo-500" />
                Promover a Admin
              </button>
            )}
            {canManageAdmin && (
              <button
                onClick={() => { onDemote(); setOpen(false); }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[var(--foreground)] hover:bg-amber-50 hover:text-amber-700 transition-colors text-left"
              >
                <ShieldOff size={14} className="text-amber-500" />
                Remover de Admin
              </button>
            )}
            {canKick && (
              <button
                onClick={() => { onKick(); setOpen(false); }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
              >
                <UserMinus size={14} />
                Remover da Guild
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Tab: Membros ─────────────────────────────────────────────────────────────

function MembrosTab({
  members, pending, isAdmin, isFounder, onAccept, onDecline, onPromote, onDemote, onKick, onInvite,
}: {
  members: GuildMemberDTO[];
  pending: GuildRequestDTO[];
  isAdmin: boolean;
  isFounder: boolean;
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
  onPromote: (memberId: string) => void;
  onDemote: (memberId: string) => void;
  onKick: (memberId: string) => void;
  onInvite: () => void;
}) {
  return (
    <div className="space-y-6">
      {(isAdmin || isFounder) && pending.length > 0 && (
        <div className="p-5 rounded-xl bg-amber-50 border border-amber-200">
          <div className="flex items-center gap-2 mb-4">
            <Bell size={14} className="text-amber-600" />
            <span className="text-sm font-semibold text-amber-700">
              {pending.length} pedido(s) de entrada
            </span>
          </div>
          <div className="space-y-3">
            {pending.map(req => (
              <div key={req.id} className="flex items-center gap-3 p-3 rounded-xl bg-white border border-amber-100">
                <MemberAvatar name={req.name} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[var(--foreground)] text-sm">{req.name}</div>
                  <div className="text-xs text-[var(--muted-foreground)]">@{req.nickname} · Nível {req.level}</div>
                  {req.message && (
                    <div className="text-xs text-[var(--muted-foreground)] mt-0.5 italic">"{req.message}"</div>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => onAccept(req.id)}
                    className="px-3 py-1.5 rounded-lg bg-green-50 border border-green-200 text-green-700 text-xs font-medium hover:bg-green-100 transition-colors flex items-center gap-1"
                  >
                    <Check size={11} /> Aceitar
                  </button>
                  <button
                    onClick={() => onDecline(req.id)}
                    className="px-3 py-1.5 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs font-medium hover:bg-red-100 transition-colors"
                  >
                    Recusar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        {members.map((m, i) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className="flex items-center gap-4 p-4 rounded-xl bg-[var(--card)] border border-[var(--border)] hover:border-indigo-200 hover:shadow-sm transition-all"
          >
            <div className="text-[var(--muted-foreground)] font-bold text-sm w-6 text-center">{i + 1}</div>
            <MemberAvatar name={m.name} size="md" online={m.online} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[var(--foreground)] text-sm truncate">{m.name}</span>
                {(m.role === "founder" || m.role === "admin") && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 border border-indigo-100 text-indigo-700 font-semibold capitalize">
                    {m.role === "founder" ? "Fundador" : "Admin"}
                  </span>
                )}
              </div>
              <div className="text-xs text-[var(--muted-foreground)]">@{m.nickname} · Nível {m.level}</div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-sm font-bold text-amber-600">{m.xp.toLocaleString()}</div>
              <div className="text-[10px] text-[var(--muted-foreground)]">XP</div>
            </div>
            {m.streak > 0 && (
              <div className="flex items-center gap-1 text-xs text-orange-500 shrink-0">
                <Flame size={11} /> {m.streak}d
              </div>
            )}
            {(isAdmin || isFounder) && m.role !== "founder" && (
              <MemberActionsMenu
                member={m}
                isFounder={isFounder}
                onPromote={() => onPromote(m.id)}
                onDemote={() => onDemote(m.id)}
                onKick={() => onKick(m.id)}
              />
            )}
          </motion.div>
        ))}
      </div>

      {(isAdmin || isFounder) && (
        <button
          onClick={onInvite}
          className="w-full py-3 rounded-xl border border-dashed border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:border-indigo-300 text-sm flex items-center justify-center gap-2 transition-colors"
        >
          <UserPlus size={14} /> Convidar Membros
        </button>
      )}
    </div>
  );
}

// ─── Tab: Materiais ───────────────────────────────────────────────────────────

function MateriaisTab({ materials, isAdmin, onUpload }: { materials: GuildMaterialDTO[]; isAdmin: boolean; onUpload: () => void }) {
  const iconMap: Record<string, React.ElementType> = { pdf: FileText, video: Video, link: Link2 };
  const colorMap: Record<string, string> = { pdf: "text-red-500", video: "text-blue-500", link: "text-green-600" };
  const bgMap: Record<string, string> = { pdf: "bg-red-50", video: "bg-blue-50", link: "bg-green-50" };

  return (
    <div className="space-y-4">
      {isAdmin && (
        <button
          onClick={onUpload}
          className="w-full py-4 rounded-xl border border-dashed border-indigo-300 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-sm flex items-center justify-center gap-2 transition-colors"
        >
          <Upload size={15} /> Compartilhar Material com a Guild
        </button>
      )}
      {materials.length === 0 ? (
        <div className="text-center py-16 text-[var(--muted-foreground)]">
          <BookOpen size={36} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Nenhum material compartilhado ainda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {materials.map(mat => {
            const Icon = iconMap[mat.type?.toLowerCase()] ?? FileText;
            const color = colorMap[mat.type?.toLowerCase()] ?? "text-[var(--muted-foreground)]";
            const bg = bgMap[mat.type?.toLowerCase()] ?? "bg-[var(--muted)]";
            return (
              <motion.a
                key={mat.id}
                href={mat.url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-4 rounded-xl bg-[var(--card)] border border-[var(--border)] hover:border-indigo-200 hover:shadow-sm transition-all group cursor-pointer"
              >
                <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center ${color} shrink-0`}>
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-[var(--foreground)] text-sm truncate">{mat.title}</div>
                  <div className="text-[11px] text-[var(--muted-foreground)]">
                    por @{mat.uploader}{mat.size ? ` · ${mat.size}` : ""} · {mat.date}
                  </div>
                </div>
                <ChevronRight size={14} className="text-[var(--muted-foreground)] group-hover:text-[var(--foreground)] transition-colors shrink-0" />
              </motion.a>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Tab: Ranking ─────────────────────────────────────────────────────────────

function RankingTab({ guild, members }: { guild: GuildResponseDTO; members: GuildMemberDTO[] }) {
  const leagueColor = leagueColors[guild.league?.toUpperCase()] ?? "#CD7F32";
  const leagueLabel = guild.league
    ? guild.league.charAt(0).toUpperCase() + guild.league.slice(1).toLowerCase()
    : "Bronze";

  return (
    <div className="space-y-6">
      <div
        className="p-6 rounded-xl border shadow-sm"
        style={{ background: `linear-gradient(135deg, ${leagueColor}15, #f8fafc)`, borderColor: `${leagueColor}40` }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-xs uppercase tracking-wider mb-1 font-semibold" style={{ color: leagueColor }}>
              Posição Global
            </div>
            <div className="text-4xl font-black" style={{ color: leagueColor }}>
              #{guild.rankPosition}
            </div>
          </div>
          <GuildBadge type={guild.badge as GuildBadgeType} size="lg" showGlow />
        </div>
        <div className="text-sm text-[var(--muted-foreground)] mb-3">
          Liga:{" "}
          <span className="font-bold" style={{ color: leagueColor }}>
            {leagueLabel}
          </span>
        </div>
        <XPBar value={guild.weeklyXp} max={guild.weeklyGoal} color={leagueColor} />
        <div className="flex justify-between mt-1 text-xs text-[var(--muted-foreground)]">
          <span>{guild.weeklyXp.toLocaleString("pt-BR")}</span>
          <span>{guild.weeklyGoal.toLocaleString("pt-BR")} XP meta</span>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3 flex items-center gap-2">
          <Trophy size={14} className="text-indigo-600" /> Ranking Interno
        </h3>
        <div className="space-y-2">
          {members.map((m, i) => (
            <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--card)] border border-[var(--border)] hover:border-indigo-200 transition-all">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${i === 0 ? "bg-amber-400 text-white" :
                i === 1 ? "bg-slate-300 text-slate-700" :
                  i === 2 ? "bg-amber-700 text-white" :
                    "bg-[var(--muted)] text-[var(--muted-foreground)]"
                }`}>{i + 1}</div>
              <MemberAvatar name={m.name} size="sm" />
              <div className="flex-1 text-sm text-[var(--foreground)] font-medium truncate">{m.name}</div>
              <div className="text-right shrink-0">
                <div className="text-sm font-bold text-amber-600">{m.xp.toLocaleString()}</div>
                <div className="text-[10px] text-[var(--muted-foreground)]">XP</div>
              </div>
              {i === 0 && <Crown size={13} className="text-amber-500 shrink-0" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Missões ─────────────────────────────────────────────────────────────

function MissoesTab({ missions }: { missions: GuildMissionDTO[] }) {
  const typeCfg: Record<string, { label: string; color: string; border: string; bg: string }> = {
    daily: { label: "Diária", color: "text-green-700", border: "border-green-200", bg: "bg-green-50" },
    weekly: { label: "Semanal", color: "text-indigo-700", border: "border-indigo-200", bg: "bg-indigo-50" },
    monthly: { label: "Mensal", color: "text-purple-700", border: "border-purple-200", bg: "bg-purple-50" },
  };

  if (missions.length === 0) {
    return (
      <div className="text-center py-20 text-[var(--muted-foreground)]">
        <Target size={36} className="mx-auto mb-3 opacity-30" />
        <p className="text-sm">Nenhuma missão disponível.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {missions.map(m => {
        const cfg = typeCfg[m.type?.toLowerCase()] ?? typeCfg.weekly;
        const isLargeNumber = m.total > 1000;
        const progressLabel = isLargeNumber
          ? `${(m.progress / 1000).toFixed(1)}k / ${(m.total / 1000).toFixed(1)}k XP`
          : `${m.progress} / ${m.total}`;

        return (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-5 rounded-xl border shadow-sm ${m.completed ? "bg-green-50 border-green-200" : "bg-[var(--card)] border-[var(--border)]"}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider ${cfg.color} ${cfg.bg} border ${cfg.border}`}>
                  {cfg.label}
                </span>
                {m.completed && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 border border-green-300 text-green-700 font-semibold flex items-center gap-1">
                    <Check size={9} /> Concluída
                  </span>
                )}
              </div>
              {m.endsAt && !m.completed && (
                <span className="text-xs text-[var(--muted-foreground)] flex items-center gap-1 shrink-0">
                  <Clock size={11} /> {m.endsAt}
                </span>
              )}
            </div>
            <h4 className="font-bold text-[var(--foreground)] mb-1">{m.title}</h4>
            <p className="text-xs text-[var(--muted-foreground)] mb-4">{m.description}</p>
            <XPBar value={m.progress} max={m.total} color={m.completed ? "#22C55E" : "#6366F1"} />
            <div className="flex justify-between mt-1.5 text-[11px] text-[var(--muted-foreground)]">
              <span>{progressLabel}</span>
              <span className="text-amber-600 font-semibold flex items-center gap-1">
                <Award size={10} /> +{m.xpReward} XP
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── Tab: Anotações ───────────────────────────────────────────────────────────

function AnotacoesTab({ notes }: { notes: GuildNoteDTO[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (notes.length === 0) {
    return (
      <div className="text-center py-20 text-[var(--muted-foreground)]">
        <StickyNote size={36} className="mx-auto mb-3 opacity-30" />
        <p className="font-medium text-[var(--foreground)]">Nenhuma anotação ainda.</p>
        <p className="text-sm mt-1">Membros podem compartilhar anotações de estudo com a guild.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {notes.map((note, i) => (
        <motion.div
          key={note.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04 }}
          className="group bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden hover:border-indigo-200 hover:shadow-sm transition-all cursor-pointer"
          onClick={() => setExpanded(expanded === note.id ? null : note.id)}
        >
          {/* Color accent top */}
          <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-400 to-transparent" />
          <div className="p-5">
            <div className="flex items-start justify-between gap-2 mb-3">
              <h4 className="font-bold text-[var(--foreground)] text-sm leading-snug">{note.title}</h4>
              <ChevronRight
                size={14}
                className={`text-[var(--muted-foreground)] shrink-0 transition-transform mt-0.5 ${expanded === note.id ? "rotate-90" : ""}`}
              />
            </div>
            <AnimatePresence initial={false}>
              {expanded === note.id ? (
                <motion.div
                  key="expanded"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <p className="text-sm text-[var(--foreground)] leading-relaxed whitespace-pre-wrap mb-3">
                    {note.content}
                  </p>
                </motion.div>
              ) : (
                <p className="text-xs text-[var(--muted-foreground)] line-clamp-2 mb-3">{note.content}</p>
              )}
            </AnimatePresence>
            <div className="flex items-center justify-between text-[11px] text-[var(--muted-foreground)]">
              <span className="flex items-center gap-1">
                <PenLine size={10} /> {note.author}
              </span>
              <span>{note.updatedAt}</span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Tab: Tarefas ─────────────────────────────────────────────────────────────

function TarefasTab({ tasks }: { tasks: GuildTaskDTO[] }) {
  const cols: { status: string; label: string; color: string; icon: React.ElementType }[] = [
    { status: "TODO", label: "A Fazer", color: "text-slate-500", icon: ListTodo },
    { status: "IN_PROGRESS", label: "Em Progresso", color: "text-indigo-600", icon: RotateCcw },
    { status: "DONE", label: "Concluído", color: "text-green-600", icon: CheckSquare },
  ];

  const priorityStyle: Record<string, string> = {
    LOW: "text-slate-500 bg-slate-50 border-slate-200",
    MEDIUM: "text-amber-700 bg-amber-50 border-amber-200",
    HIGH: "text-red-600 bg-red-50 border-red-200",
  };
  const priorityLabel: Record<string, string> = { LOW: "Baixa", MEDIUM: "Média", HIGH: "Alta" };

  if (tasks.length === 0) {
    return (
      <div className="text-center py-20 text-[var(--muted-foreground)]">
        <ListTodo size={36} className="mx-auto mb-3 opacity-30" />
        <p className="font-medium text-[var(--foreground)]">Nenhuma tarefa criada.</p>
        <p className="text-sm mt-1">Organize o grupo com tarefas e prazos compartilhados.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cols.map(col => {
        const Icon = col.icon;
        const colTasks = tasks.filter(t => t.status === col.status);
        return (
          <div key={col.status} className="bg-[var(--muted)] border border-[var(--border)] rounded-xl p-4">
            <div className={`flex items-center gap-2 mb-4 ${col.color}`}>
              <Icon size={14} />
              <span className="text-sm font-semibold">{col.label}</span>
              <span className="ml-auto text-[11px] bg-[var(--card)] border border-[var(--border)] px-2 py-0.5 rounded-full text-[var(--muted-foreground)]">
                {colTasks.length}
              </span>
            </div>
            <div className="space-y-3">
              {colTasks.length === 0 ? (
                <p className="text-xs text-[var(--muted-foreground)] text-center py-4">Vazio</p>
              ) : (
                colTasks.map((task, i) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="p-3 rounded-xl bg-[var(--card)] border border-[var(--border)] hover:border-indigo-200 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="text-sm text-[var(--foreground)] font-medium leading-snug">{task.title}</p>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border font-semibold shrink-0 ${priorityStyle[task.priority] ?? priorityStyle.LOW}`}>
                        {priorityLabel[task.priority] ?? task.priority}
                      </span>
                    </div>
                    {task.description && (
                      <p className="text-xs text-[var(--muted-foreground)] mb-2 line-clamp-2">{task.description}</p>
                    )}
                    <div className="flex items-center justify-between text-[11px] text-[var(--muted-foreground)]">
                      <span>{task.assignee}</span>
                      {task.dueDate && (
                        <span className="flex items-center gap-1">
                          <Clock size={10} /> {task.dueDate}
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Tab: Flash Cards ─────────────────────────────────────────────────────────

function FlashCardsTab({ guildId, decks }: { guildId: string; decks: GuildFlashcardDeckDTO[] }) {
  const { notify } = useNotification();
  const [selectedDeck, setSelectedDeck] = useState<GuildFlashcardDeckDTO | null>(null);
  const [cards, setCards] = useState<GuildFlashcardDTO[]>([]);
  const [loadingCards, setLoadingCards] = useState(false);
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  async function openDeck(deck: GuildFlashcardDeckDTO) {
    setSelectedDeck(deck);
    setCardIndex(0);
    setFlipped(false);
    setLoadingCards(true);
    try {
      const data = await GuildService.getFlashcardCards(guildId, deck.id);
      setCards(data);
    } catch {
      notify("Erro", "Não foi possível carregar os cards.", "error");
    } finally {
      setLoadingCards(false);
    }
  }

  function next() { setCardIndex(i => Math.min(i + 1, cards.length - 1)); setFlipped(false); }
  function prev() { setCardIndex(i => Math.max(i - 1, 0)); setFlipped(false); }

  if (decks.length === 0) {
    return (
      <div className="text-center py-20 text-[var(--muted-foreground)]">
        <Layers size={36} className="mx-auto mb-3 opacity-30" />
        <p className="font-medium text-[var(--foreground)]">Nenhum deck compartilhado.</p>
        <p className="text-sm mt-1">Membros podem compartilhar decks de flash cards com a guild.</p>
      </div>
    );
  }

  // Card viewer
  if (selectedDeck) {
    const card = cards[cardIndex];
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setSelectedDeck(null); setCards([]); }}
            className="flex items-center gap-1.5 text-[var(--muted-foreground)] hover:text-[var(--foreground)] text-sm transition-colors group"
          >
            <ChevronLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
            Decks
          </button>
          <span className="text-[var(--muted-foreground)]">/</span>
          <span className="text-[var(--foreground)] font-semibold text-sm">{selectedDeck.title}</span>
          <span className="ml-auto text-xs text-[var(--muted-foreground)]">{cardIndex + 1} / {cards.length}</span>
        </div>

        {loadingCards ? (
          <div className="h-64 rounded-xl bg-[var(--card)] border border-[var(--border)] shadow-sm flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          </div>
        ) : cards.length === 0 ? (
          <div className="h-64 rounded-xl bg-[var(--card)] border border-[var(--border)] shadow-sm flex items-center justify-center text-[var(--muted-foreground)] text-sm">
            Nenhum card neste deck.
          </div>
        ) : card ? (
          <>
            {/* Flip card */}
            <div
              className="relative h-64 cursor-pointer select-none"
              style={{ perspective: "1200px" }}
              onClick={() => setFlipped(f => !f)}
            >
              <motion.div
                animate={{ rotateY: flipped ? 180 : 0 }}
                transition={{ duration: 0.45, ease: "easeInOut" }}
                style={{ transformStyle: "preserve-3d" }}
                className="relative w-full h-full"
              >
                {/* Front */}
                <div
                  className="absolute inset-0 rounded-xl bg-white border border-[var(--border)] shadow-md flex flex-col items-center justify-center p-8 text-center"
                  style={{ backfaceVisibility: "hidden" }}
                >
                  <div className="text-[10px] text-[var(--muted-foreground)] uppercase tracking-widest mb-4">Pergunta</div>
                  <p className="text-[var(--foreground)] text-lg font-semibold leading-relaxed">{card.front}</p>
                  <div className="absolute bottom-4 text-xs text-[var(--muted-foreground)] flex items-center gap-1">
                    <Eye size={11} /> Clique para revelar
                  </div>
                </div>
                {/* Back */}
                <div
                  className="absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-700 border border-indigo-500 shadow-md flex flex-col items-center justify-center p-8 text-center"
                  style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                >
                  <div className="text-[10px] text-indigo-200 uppercase tracking-widest mb-4">Resposta</div>
                  <p className="text-white text-lg font-semibold leading-relaxed">{card.back}</p>
                  <div className="absolute bottom-4 text-xs text-indigo-300 flex items-center gap-1">
                    <EyeOff size={11} /> Clique para ocultar
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between gap-4">
              <button
                onClick={prev}
                disabled={cardIndex === 0}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:border-indigo-300 disabled:opacity-30 disabled:cursor-not-allowed text-sm transition-all"
              >
                <ChevronLeft size={14} /> Anterior
              </button>
              {/* Progress dots */}
              <div className="flex gap-1.5">
                {cards.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => { setCardIndex(i); setFlipped(false); }}
                    className={`rounded-full transition-all ${i === cardIndex
                      ? "w-4 h-2 bg-indigo-600"
                      : "w-2 h-2 bg-slate-200 hover:bg-slate-300"
                      }`}
                  />
                ))}
              </div>
              <button
                onClick={next}
                disabled={cardIndex === cards.length - 1}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:border-indigo-300 disabled:opacity-30 disabled:cursor-not-allowed text-sm transition-all"
              >
                Próximo <ChevronRight size={14} />
              </button>
            </div>
          </>
        ) : null}
      </div>
    );
  }

  // Deck list
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {decks.map((deck, i) => (
        <motion.button
          key={deck.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          onClick={() => openDeck(deck)}
          className="group text-left p-5 rounded-xl bg-[var(--card)] border border-[var(--border)] hover:border-indigo-300 hover:shadow-md transition-all duration-300"
        >
          {/* Icon / Color badge */}
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4"
            style={{ background: deck.color ? `${deck.color}20` : "var(--muted)", border: `1px solid ${deck.color ?? "var(--border)"}40` }}
          >
            {deck.icon ?? "📚"}
          </div>
          <h4 className="font-bold text-[var(--foreground)] mb-1">{deck.title}</h4>
          {deck.description && (
            <p className="text-xs text-[var(--muted-foreground)] mb-3 line-clamp-2">{deck.description}</p>
          )}
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--muted-foreground)]">
              {deck.cardCount} {deck.cardCount === 1 ? "card" : "cards"}
            </span>
            <span className="text-xs text-indigo-600 flex items-center gap-1 group-hover:gap-2 transition-all">
              Estudar <ChevronRight size={12} />
            </span>
          </div>
        </motion.button>
      ))}
    </div>
  );
}

// ─── Page skeleton ────────────────────────────────────────────────────────────

function PageSkeleton() {
  return (
    <div className="p-6 lg:p-8 w-full max-w-[1600px] mx-auto space-y-6">
      <Skeleton className="h-5 w-32 rounded" />
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-8">
        <div className="flex gap-6">
          <Skeleton className="w-28 h-28 rounded-2xl shrink-0" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-8 w-1/2 rounded" />
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-3/4 rounded" />
            <div className="flex gap-4">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-4 w-24 rounded" />)}
            </div>
          </div>
        </div>
      </div>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-9 w-24 rounded-xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-40 w-full rounded-xl" />)}
        </div>
        <div className="space-y-4">
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function GuildDetailPage() {
  const params = useParams();
  const guildId = params.id as string;
  const { notify } = useNotification();
  const { user } = useAuth();

  const [tab, setTab] = useState<GuildTab>("inicio");
  const [guild, setGuild] = useState<GuildResponseDTO | null>(null);
  const [members, setMembers] = useState<GuildMemberDTO[]>([]);
  const [pending, setPending] = useState<GuildRequestDTO[]>([]);
  const [materials, setMaterials] = useState<GuildMaterialDTO[]>([]);
  const [missions, setMissions] = useState<GuildMissionDTO[]>([]);
  const [activity, setActivity] = useState<GuildActivityDTO[]>([]);
  const [messages, setMessages] = useState<GuildMessageDTO[]>([]);
  const [notes, setNotes] = useState<GuildNoteDTO[]>([]);
  const [tasks, setTasks] = useState<GuildTaskDTO[]>([]);
  const [decks, setDecks] = useState<GuildFlashcardDeckDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // ── Initial data load ──
  useEffect(() => {
    if (!guildId) return;

    const load = async () => {
      setLoading(true);
      try {
        const [
          guildData, membersData, materialsData, missionsData,
          activityData, chatData, notesData, tasksData, decksData,
        ] = await Promise.allSettled([
          GuildService.getGuild(guildId),
          GuildService.getMembers(guildId),
          GuildService.getMaterials(guildId),
          GuildService.getMissions(guildId),
          GuildService.getActivity(guildId),
          GuildService.getChatMessages(guildId),
          GuildService.getNotes(guildId),
          GuildService.getTasks(guildId),
          GuildService.getFlashcardDecks(guildId),
        ]);

        if (guildData.status === "fulfilled") setGuild(guildData.value);
        else { notify("Erro", "Guild não encontrada.", "error"); return; }

        if (membersData.status === "fulfilled") {
          setMembers(membersData.value.members ?? []);
          setPending(membersData.value.pendingRequests ?? []);
        }
        if (materialsData.status === "fulfilled") setMaterials(materialsData.value);
        if (missionsData.status === "fulfilled") setMissions(missionsData.value);
        if (activityData.status === "fulfilled") setActivity(activityData.value);
        if (chatData.status === "fulfilled") setMessages(chatData.value);
        if (notesData.status === "fulfilled") setNotes(notesData.value);
        if (tasksData.status === "fulfilled") setTasks(tasksData.value);
        if (decksData.status === "fulfilled") setDecks(decksData.value);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [guildId, notify]);

  // ── Chat polling (every 8s) ──
  useEffect(() => {
    if (!guildId) return;
    const interval = setInterval(async () => {
      try {
        const data = await GuildService.getChatMessages(guildId);
        setMessages(data);
      } catch {
        // silent fail
      }
    }, 8000);
    return () => clearInterval(interval);
  }, [guildId]);

  // ── Send chat message ──
  const handleSendMessage = useCallback(async (text: string) => {
    try {
      const msg = await GuildService.sendMessage(guildId, text);
      setMessages(prev => [...prev, msg]);
    } catch {
      notify("Erro", "Não foi possível enviar a mensagem.", "error");
    }
  }, [guildId, notify]);

  // ── Approve join request ──
  const handleAccept = useCallback(async (requestId: string) => {
    const req = pending.find(r => r.id === requestId);
    setPending(prev => prev.filter(r => r.id !== requestId));
    try {
      await GuildService.approveRequest(guildId, requestId);
      if (req) {
        const newMember: GuildMemberDTO = {
          id: requestId,
          name: req.name,
          nickname: req.nickname,
          level: req.level,
          xp: 0,
          role: "member",
          streak: 0,
          joinDate: new Date().toLocaleDateString("pt-BR"),
          avatar: null,
          online: false,
        };
        setMembers(prev => [...prev, newMember]);
      }
      notify("Aprovado", `${req?.name ?? "Membro"} entrou na guild.`, "success");
    } catch (e: any) {
      setPending(prev => req ? [...prev, req] : prev);
      notify("Erro", e.message ?? "Não foi possível aprovar o pedido.", "error");
    }
  }, [guildId, pending, notify]);

  const handleDecline = useCallback(async (requestId: string) => {
    const req = pending.find(r => r.id === requestId);
    setPending(prev => prev.filter(r => r.id !== requestId));
    try {
      await GuildService.declineRequest(guildId, requestId);
      notify("Recusado", `Pedido de ${req?.name ?? "membro"} recusado.`, "info");
    } catch (e: any) {
      setPending(prev => req ? [...prev, req] : prev);
      notify("Erro", e.message ?? "Não foi possível recusar o pedido.", "error");
    }
  }, [guildId, pending, notify]);

  // ── Promote to admin ──
  const handlePromote = useCallback(async (memberId: string) => {
    setMembers(prev => prev.map(m => m.id === memberId ? { ...m, role: "admin" } : m));
    try {
      await GuildService.promoteMember(guildId, memberId);
      notify("Promovido", "Membro promovido a Admin.", "success");
    } catch (e: any) {
      setMembers(prev => prev.map(m => m.id === memberId ? { ...m, role: "member" } : m));
      notify("Erro", e.message ?? "Não foi possível promover o membro.", "error");
    }
  }, [guildId, notify]);

  // ── Demote from admin ──
  const handleDemote = useCallback(async (memberId: string) => {
    setMembers(prev => prev.map(m => m.id === memberId ? { ...m, role: "member" } : m));
    try {
      await GuildService.demoteMember(guildId, memberId);
      notify("Rebaixado", "Admin rebaixado a membro.", "info");
    } catch (e: any) {
      setMembers(prev => prev.map(m => m.id === memberId ? { ...m, role: "admin" } : m));
      notify("Erro", e.message ?? "Não foi possível rebaixar o membro.", "error");
    }
  }, [guildId, notify]);

  // ── Kick member ──
  const handleKick = useCallback(async (memberId: string) => {
    const kicked = members.find(m => m.id === memberId);
    if (!window.confirm(`Remover ${kicked?.name ?? "este membro"} da guild?`)) return;
    setMembers(prev => prev.filter(m => m.id !== memberId));
    try {
      await GuildService.kickMember(guildId, memberId);
      notify("Removido", `${kicked?.name ?? "Membro"} foi removido da guild.`, "info");
    } catch (e: any) {
      if (kicked) setMembers(prev => [...prev, kicked]);
      notify("Erro", e.message ?? "Não foi possível remover o membro.", "error");
    }
  }, [guildId, members, notify]);

  const handleUpdateGuild = useCallback(async (data: Partial<GuildResponseDTO>) => {
    try {
      const updated = await GuildService.updateGuild(guildId, data);
      setGuild(updated);
      notify("Sucesso", "Configurações da guilda atualizadas.", "success");
    } catch (err: any) {
      notify("Erro", err.message || "Erro ao atualizar guilda", "error");
      throw err;
    }
  }, [guildId, notify]);

  const handleLeave = useCallback(async () => {
    if (!guild) return;
    if (!window.confirm(`Tem certeza que deseja sair da guild "${guild.name}"?`)) return;
    try {
      await GuildService.leaveGuild(guild.id);
      notify("Sucesso", "Você saiu da guilda.", "info");
      window.location.href = "/guilds";
    } catch (err: any) {
      notify("Erro", err.message || "Erro ao sair da guilda", "error");
    }
  }, [guild, notify]);

  const handleInviteMem = useCallback(async (uid: string) => {
    try {
      await GuildService.inviteMember(guildId, uid);
      notify("Sucesso", "Convite enviado com sucesso.", "success");
    } catch (err: any) {
      notify("Erro", err.message || "Erro ao convidar membro", "error");
      throw err;
    }
  }, [guildId, notify]);

  const handleUploadMat = useCallback(async (file: File, title: string) => {
    try {
      const mat = await GuildService.uploadMaterial(guildId, file, title);
      setMaterials(prev => [mat, ...prev]);
      notify("Sucesso", "Material compartilhado com sucesso.", "success");
    } catch (err: any) {
      notify("Erro", err.message || "Erro ao fazer upload do material", "error");
      throw err;
    }
  }, [guildId, notify]);

  const handleDeleteGuild = useCallback(async () => {
    if (!guild) return;
    if (!window.confirm(`ATENÇÃO: Deletar a guilda "${guild.name}" é permanente e apagará todos os materiais, chat e membros. Continuar?`)) return;

    try {
      await GuildService.deleteGuild(guildId);
      notify("Sucesso", "Guilda deletada permanentemente.", "info");
      window.location.href = "/guilds";
    } catch (err: any) {
      notify("Erro", err.message || "Erro ao deletar guilda", "error");
    }
  }, [guildId, guild, notify]);

  if (loading) return <PageSkeleton />;
  if (!guild) return (
    <div className="p-8 text-center text-[var(--muted-foreground)]">
      <Shield size={40} className="mx-auto mb-3 opacity-30" />
      <p>Guild não encontrada.</p>
      <Link href="/guilds" className="text-indigo-600 hover:text-indigo-700 text-sm mt-2 inline-block">
        Voltar para Guilds
      </Link>
    </div>
  );

  if (!guild.isMember && !guild.isAdmin && !guild.isFounder) {
    return (
      <div className="p-8 text-center text-[var(--muted-foreground)] flex flex-col items-center justify-center min-h-[60vh]">
        <Lock size={64} className="mx-auto mb-6 text-indigo-300 opacity-50" />
        <h2 className="text-2xl font-black text-[var(--foreground)] mb-3">Acesso Restrito</h2>
        <p className="max-w-md mb-6 leading-relaxed">
          Os detalhes, materiais e membros da guilda <strong>{guild.name}</strong> só podem ser visualizados por membros.
          Peça acesso para entrar nesta guilda.
        </p>
        <Link href="/guilds" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-colors shadow-lg shadow-indigo-600/20 flex items-center gap-2">
          <ArrowLeft size={16} /> Voltar para Guilds
        </Link>
      </div>
    );
  }

  // Derive the current user's guild role from the members list — fallback when
  // backend doesn't return isAdmin/isFounder correctly in the guild DTO.
  const myMember = members.find(m =>
    (user?.id && m.id === user.id) ||
    (user?.nickname && m.nickname === user.nickname) ||
    (user?.preferred_username && m.nickname === user.preferred_username)
  );
  const isFounder = guild.isFounder || myMember?.role === "founder";
  const isAdmin = guild.isAdmin || myMember?.role === "admin" || myMember?.role === "founder";

  const leagueColor = leagueColors[guild.league?.toUpperCase()] ?? "#CD7F32";
  const leagueLabel = guild.league
    ? guild.league.charAt(0).toUpperCase() + guild.league.slice(1).toLowerCase()
    : "Bronze";

  return (
    <div className="p-6 lg:p-8 w-full max-w-[1600px] mx-auto space-y-6">

      {/* Back */}
      <Link
        href="/guilds"
        className="inline-flex items-center gap-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] text-sm transition-colors group"
      >
        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
        Voltar para Guilds
      </Link>

      {/* Guild Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--card)] p-6 lg:p-8 shadow-sm"
      >
        {/* League color accent — top border */}
        <div className="absolute top-0 left-0 right-0 h-1" style={{ background: leagueColor }} />
        {/* Subtle background glow */}
        <div
          className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl opacity-5 translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{ background: leagueColor }}
        />

        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
          <GuildBadge type={guild.badge as GuildBadgeType} size="xl" showGlow />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h1 className="text-2xl lg:text-3xl font-black text-[var(--foreground)]">{guild.name}</h1>
              {guild.isPublic
                ? <Globe size={14} className="text-green-500" />
                : <Lock size={14} className="text-orange-500" />
              }
              <span
                className="text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider"
                style={{ color: leagueColor, background: `${leagueColor}15`, border: `1px solid ${leagueColor}40` }}
              >
                {leagueLabel}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 font-semibold">
                #{guild.rankPosition} Global
              </span>
            </div>
            <p className="text-[var(--muted-foreground)] text-sm mb-4 max-w-2xl">{guild.description}</p>
            <div className="flex flex-wrap gap-4 text-sm">
              <span className="flex items-center gap-1.5 text-[var(--muted-foreground)]">
                <Users size={13} className="text-indigo-600" />
                {guild.memberCount}/{guild.maxMembers} membros
              </span>
              <span className="flex items-center gap-1.5 text-[var(--muted-foreground)]">
                <Zap size={13} className="text-amber-500" />
                {(guild.totalXp / 1000).toFixed(1)}k XP
              </span>
              <span className="flex items-center gap-1.5 text-[var(--muted-foreground)]">
                <Flame size={13} className="text-orange-500" />
                {guild.streak} dias streak
              </span>
              <span className="flex items-center gap-1.5 text-[var(--muted-foreground)]">
                <Calendar size={13} className="text-[var(--muted-foreground)]" />
                Criada em {guild.createdAt}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {guild.isMember && !isFounder && (
              <button
                onClick={handleLeave}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 text-sm font-medium transition-colors"
              >
                <UserMinus size={14} /> Sair
              </button>
            )}

            {isAdmin && (
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--muted)] hover:bg-slate-200 border border-[var(--border)] text-[var(--foreground)] text-sm font-medium transition-colors"
              >
                <Settings size={14} /> Gerenciar
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-0 border-b border-[var(--border)]">
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-t-lg text-sm font-medium whitespace-nowrap transition-all ${tab === t.id
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]"
                }`}
            >
              <Icon size={14} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
        >
          {tab === "inicio" && (
            <InicioTab
              guild={guild}
              activity={activity}
              members={members}
              missions={missions}
              messages={messages}
              onSendMessage={handleSendMessage}
            />
          )}
          {tab === "membros" && (
            <MembrosTab
              members={members}
              pending={pending}
              isAdmin={isAdmin}
              isFounder={isFounder}
              onAccept={handleAccept}
              onDecline={handleDecline}
              onPromote={handlePromote}
              onDemote={handleDemote}
              onKick={handleKick}
              onInvite={() => setIsInviteOpen(true)}
            />
          )}
          {tab === "materiais" && (
            <MateriaisTab materials={materials} isAdmin={isAdmin} onUpload={() => setIsUploadOpen(true)} />
          )}
          {tab === "ranking" && (
            <RankingTab guild={guild} members={members} />
          )}
          {tab === "missoes" && (
            <MissoesTab missions={missions} />
          )}
          {tab === "anotacoes" && <AnotacoesTab notes={notes} />}
          {tab === "tarefas" && <TarefasTab tasks={tasks} />}
          {tab === "flashcards" && (
            <FlashCardsTab guildId={guildId} decks={decks} />
          )}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {isSettingsOpen && guild && (
          <SettingsModal
            guild={guild}
            onClose={() => setIsSettingsOpen(false)}
            onUpdate={handleUpdateGuild}
            onDelete={handleDeleteGuild}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isInviteOpen && (
          <InviteModal
            guildId={guildId}
            onClose={() => setIsInviteOpen(false)}
            onInvite={handleInviteMem}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isUploadOpen && (
          <UploadMaterialModal
            onClose={() => setIsUploadOpen(false)}
            onUpload={handleUploadMat}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
