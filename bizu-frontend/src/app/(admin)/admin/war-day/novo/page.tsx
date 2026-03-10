"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Swords, Save, Plus, Trash2, Map, Calendar, Zap, Users } from "lucide-react";
import Link from "next/link";
import {
  AdminWarDayService,
  MapTemplate,
  CreateEventRequest,
  CreateMapTemplateRequest,
  CreateZoneRequest,
} from "@/lib/warDayService";
import { useNotification } from "@/components/NotificationProvider";

function toLocalDatetimeInputValue(isoOrEmpty: string): string {
  if (!isoOrEmpty) return "";
  return isoOrEmpty.slice(0, 16); // "2026-03-10T14:00"
}

function toISOFromInput(localDatetime: string): string {
  if (!localDatetime) return "";
  return new Date(localDatetime).toISOString();
}

const ZONE_TYPES = ["CAMP", "WATCHTOWER", "FORTRESS", "CASTLE", "BOSS"];
const DIFFICULTY_LABELS = ["", "Fácil", "Médio", "Difícil", "Boss"];

function ZoneRow({
  zone, index, onChange, onRemove,
}: {
  zone: CreateZoneRequest;
  index: number;
  onChange: (updated: CreateZoneRequest) => void;
  onRemove: () => void;
}) {
  return (
    <div className="p-4 rounded-xl border border-white/8 bg-white/3 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Zona {index + 1}</span>
        <button onClick={onRemove} className="text-red-400/60 hover:text-red-400 transition-colors">
          <Trash2 size={14} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Nome</label>
          <input
            value={zone.name}
            onChange={(e) => onChange({ ...zone, name: e.target.value })}
            placeholder="Ex: Torre do Norte"
            className="w-full px-3 py-2 rounded-lg bg-white/6 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500/60"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Tipo</label>
          <select
            value={zone.zoneType}
            onChange={(e) => onChange({ ...zone, zoneType: e.target.value })}
            className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500/60"
          >
            {ZONE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Dificuldade (1-4)</label>
          <input type="number" min={1} max={4}
            value={zone.difficultyLevel}
            onChange={(e) => onChange({ ...zone, difficultyLevel: +e.target.value })}
            className="w-full px-3 py-2 rounded-lg bg-white/6 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500/60"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Qtd Questões</label>
          <input type="number" min={5} max={50}
            value={zone.questionCount}
            onChange={(e) => onChange({ ...zone, questionCount: +e.target.value })}
            className="w-full px-3 py-2 rounded-lg bg-white/6 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500/60"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Pontos p/ acerto</label>
          <input type="number" min={5}
            value={zone.pointsPerCorrect}
            onChange={(e) => onChange({ ...zone, pointsPerCorrect: +e.target.value })}
            className="w-full px-3 py-2 rounded-lg bg-white/6 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500/60"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Ordem de exibição</label>
          <input type="number" min={0}
            value={zone.displayOrder}
            onChange={(e) => onChange({ ...zone, displayOrder: +e.target.value })}
            className="w-full px-3 py-2 rounded-lg bg-white/6 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500/60"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Posição X (0.0-1.0)</label>
          <input type="number" min={0} max={1} step={0.05}
            value={zone.positionX}
            onChange={(e) => onChange({ ...zone, positionX: +e.target.value })}
            className="w-full px-3 py-2 rounded-lg bg-white/6 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500/60"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Posição Y (0.0-1.0)</label>
          <input type="number" min={0} max={1} step={0.05}
            value={zone.positionY}
            onChange={(e) => onChange({ ...zone, positionY: +e.target.value })}
            className="w-full px-3 py-2 rounded-lg bg-white/6 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500/60"
          />
        </div>
      </div>
    </div>
  );
}

function newZone(order: number): CreateZoneRequest {
  return {
    name: "",
    zoneType: "CAMP",
    difficultyLevel: 1,
    positionX: 0.1 + order * 0.15,
    positionY: 0.2 + (order % 2) * 0.3,
    questionCount: 10,
    pointsPerCorrect: 10,
    terrainType: "PLAINS",
    displayOrder: order,
    prerequisiteZoneIds: [],
  };
}

export default function CreateWarDayPage() {
  const router = useRouter();
  const { notify } = useNotification();

  const [saving, setSaving] = useState(false);
  const [templates, setTemplates] = useState<MapTemplate[]>([]);
  const [useExistingTemplate, setUseExistingTemplate] = useState(true);

  // Event form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [xpReward, setXpReward] = useState(10);
  const [minGuildSize, setMinGuildSize] = useState(1);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");

  // New template form
  const [templateName, setTemplateName] = useState("");
  const [zones, setZones] = useState<CreateZoneRequest[]>([newZone(0)]);

  useEffect(() => {
    AdminWarDayService.listMapTemplates()
      .then((t) => { setTemplates(t); if (t.length > 0) setSelectedTemplateId(t[0].id); })
      .catch(() => {});
  }, []);

  const handleSubmit = async () => {
    if (!title || !startAt || !endAt) {
      notify("Preencha todos os campos obrigatórios", "error"); return;
    }

    setSaving(true);
    try {
      let mapTemplateId = selectedTemplateId || undefined;

      // Create new template if needed
      if (!useExistingTemplate && templateName) {
        const tmpl = await AdminWarDayService.createMapTemplate({ name: templateName, zones });
        mapTemplateId = tmpl.id;
      }

      const req: CreateEventRequest = {
        title,
        description: description || undefined,
        startAt: toISOFromInput(startAt),
        endAt: toISOFromInput(endAt),
        xpRewardPerCorrect: xpReward,
        minGuildSize,
        mapTemplateId,
      };

      await AdminWarDayService.createEvent(req);
      notify("Evento criado com sucesso!", "success");
      router.push("/admin/war-day");
    } catch (e: any) {
      notify(e.message ?? "Erro ao criar evento", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/war-day">
          <button className="text-gray-500 hover:text-white transition-colors"><ArrowLeft size={20} /></button>
        </Link>
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <Swords size={20} className="text-red-400" />
            Novo War Day
          </h1>
          <p className="text-gray-500 text-sm">Configure o evento de batalha entre guilds</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Event info */}
        <div className="rounded-2xl border border-white/8 p-6 space-y-4"
          style={{ background: "rgba(15,15,30,0.7)" }}>
          <h2 className="font-bold text-white flex items-center gap-2">
            <Calendar size={18} className="text-indigo-400" />
            Informações do Evento
          </h2>

          <div>
            <label className="text-xs text-gray-400 mb-1 block">Título *</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: War Day — Semana 1"
              className="w-full px-4 py-2.5 rounded-xl bg-white/6 border border-white/10 text-white focus:outline-none focus:border-indigo-500/60" />
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1 block">Descrição</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrição do evento (opcional)"
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
                XP por resposta certa (vencedor)
              </label>
              <input type="number" min={1} value={xpReward} onChange={(e) => setXpReward(+e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/6 border border-white/10 text-white focus:outline-none focus:border-indigo-500/60" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                <Users size={12} />
                Tamanho mínimo da guild
              </label>
              <input type="number" min={1} value={minGuildSize} onChange={(e) => setMinGuildSize(+e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/6 border border-white/10 text-white focus:outline-none focus:border-indigo-500/60" />
            </div>
          </div>
        </div>

        {/* Map template */}
        <div className="rounded-2xl border border-white/8 p-6 space-y-4"
          style={{ background: "rgba(15,15,30,0.7)" }}>
          <h2 className="font-bold text-white flex items-center gap-2">
            <Map size={18} className="text-indigo-400" />
            Template de Mapa
          </h2>

          <div className="flex gap-3">
            <button
              onClick={() => setUseExistingTemplate(true)}
              className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: useExistingTemplate ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${useExistingTemplate ? "rgba(99,102,241,0.4)" : "rgba(255,255,255,0.1)"}`,
                color: useExistingTemplate ? "#818CF8" : "#6B7280",
              }}
            >
              Usar existente
            </button>
            <button
              onClick={() => setUseExistingTemplate(false)}
              className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: !useExistingTemplate ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${!useExistingTemplate ? "rgba(99,102,241,0.4)" : "rgba(255,255,255,0.1)"}`,
                color: !useExistingTemplate ? "#818CF8" : "#6B7280",
              }}
            >
              Criar novo
            </button>
          </div>

          {useExistingTemplate ? (
            templates.length === 0 ? (
              <p className="text-sm text-gray-500">Nenhum template criado. Crie um novo abaixo.</p>
            ) : (
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
            )
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Nome do Template</label>
                <input value={templateName} onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Ex: Mapa da Floresta Sombria"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/6 border border-white/10 text-white focus:outline-none focus:border-indigo-500/60" />
              </div>

              <div className="space-y-3">
                {zones.map((z, i) => (
                  <ZoneRow
                    key={i}
                    zone={z}
                    index={i}
                    onChange={(updated) => setZones((prev) => prev.map((z2, j) => j === i ? updated : z2))}
                    onRemove={() => setZones((prev) => prev.filter((_, j) => j !== i))}
                  />
                ))}
              </div>

              <button
                onClick={() => setZones((prev) => [...prev, newZone(prev.length)])}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-indigo-400 border border-indigo-400/20 hover:bg-indigo-400/5 transition-colors"
              >
                <Plus size={16} />
                Adicionar Zona
              </button>
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-white text-base transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100"
          style={{ background: "linear-gradient(135deg, #7F1D1D, #EF4444)" }}
        >
          {saving ? (
            <motion.div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
              animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} />
          ) : <Save size={20} />}
          {saving ? "Criando..." : "Criar War Day"}
        </button>
      </div>
    </div>
  );
}
