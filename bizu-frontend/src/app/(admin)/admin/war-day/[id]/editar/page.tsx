"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Swords, Save, Calendar, Zap, Users } from "lucide-react";
import Link from "next/link";
import { AdminWarDayService, MapTemplate, WarDayEvent } from "@/lib/warDayService";
import { useNotification } from "@/components/NotificationProvider";

function toLocalDatetimeInputValue(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function EditWarDayPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { notify } = useNotification();

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<MapTemplate[]>([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [xpReward, setXpReward] = useState(10);
  const [minGuildSize, setMinGuildSize] = useState(1);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");

  useEffect(() => {
    Promise.all([
      AdminWarDayService.listEvents().then((events) => events.find((e) => e.id === id)),
      AdminWarDayService.listMapTemplates(),
    ]).then(([event, tmpls]) => {
      if (event) {
        setTitle(event.title);
        setDescription(event.description ?? "");
        setStartAt(toLocalDatetimeInputValue(event.startAt));
        setEndAt(toLocalDatetimeInputValue(event.endAt));
        setXpReward(event.xpRewardPerCorrect);
        setMinGuildSize(event.minGuildSize);
        setSelectedTemplateId(event.mapTemplate?.id ?? "");
      }
      setTemplates(tmpls);
    }).finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async () => {
    if (!title || !startAt || !endAt) {
      notify("Preencha todos os campos obrigatórios", "error"); return;
    }
    setSaving(true);
    try {
      await AdminWarDayService.updateEvent(id, {
        title,
        description: description || undefined,
        startAt: new Date(startAt).toISOString(),
        endAt: new Date(endAt).toISOString(),
        xpRewardPerCorrect: xpReward,
        minGuildSize,
        mapTemplateId: selectedTemplateId || undefined,
      });
      notify("Evento atualizado!", "success");
      router.push("/admin/war-day");
    } catch (e: any) {
      notify(e.message ?? "Erro ao atualizar", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="p-8 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/war-day">
          <button className="text-gray-500 hover:text-white transition-colors"><ArrowLeft size={20} /></button>
        </Link>
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <Swords size={20} className="text-red-400" />
            Editar War Day
          </h1>
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-2xl border border-white/8 p-6 space-y-4"
          style={{ background: "rgba(15,15,30,0.7)" }}>
          <h2 className="font-bold text-white flex items-center gap-2">
            <Calendar size={18} className="text-indigo-400" />
            Informações
          </h2>

          <div>
            <label className="text-xs text-gray-400 mb-1 block">Título *</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white/6 border border-white/10 text-white focus:outline-none focus:border-indigo-500/60" />
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1 block">Descrição</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl bg-white/6 border border-white/10 text-white focus:outline-none focus:border-indigo-500/60 resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Início *</label>
              <input type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/6 border border-white/10 text-white focus:outline-none focus:border-indigo-500/60" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Fim *</label>
              <input type="datetime-local" value={endAt} onChange={(e) => setEndAt(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/6 border border-white/10 text-white focus:outline-none focus:border-indigo-500/60" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                <Zap size={12} className="text-yellow-400" />
                XP por resposta certa
              </label>
              <input type="number" min={1} value={xpReward} onChange={(e) => setXpReward(+e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/6 border border-white/10 text-white focus:outline-none focus:border-indigo-500/60" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                <Users size={12} />
                Tamanho mínimo
              </label>
              <input type="number" min={1} value={minGuildSize} onChange={(e) => setMinGuildSize(+e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/6 border border-white/10 text-white focus:outline-none focus:border-indigo-500/60" />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1 block">Template de Mapa</label>
            <select
              value={selectedTemplateId}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-white focus:outline-none focus:border-indigo-500/60"
            >
              <option value="">Sem template</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>{t.name} ({t.zones.length} zonas)</option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-white text-base transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, #7F1D1D, #EF4444)" }}
        >
          {saving ? (
            <motion.div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
              animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} />
          ) : <Save size={20} />}
          {saving ? "Salvando..." : "Salvar Alterações"}
        </button>
      </div>
    </div>
  );
}
