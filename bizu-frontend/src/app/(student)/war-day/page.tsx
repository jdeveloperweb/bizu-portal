"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Swords, Trophy, Clock, Users, Flame, Shield, Crown, Calendar,
} from "lucide-react";
import { WarDayService, WarDayEvent } from "@/lib/warDayService";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/components/AuthProvider";
import WarDayEventCard from "@/components/war-day/WarDayEventCard";

function HowItWorksSection() {
  const steps = [
    { icon: <Users size={24} />, title: "Sua guild entra no mapa", desc: "Todos os membros da guild acessam o mesmo mapa interativo e trabalham juntos." },
    { icon: <Swords size={24} />, title: "Conquiste zonas respondendo questões", desc: "Clique em uma zona disponível e responda questões do banco. Acertos acumulam pontos para a guild." },
    { icon: <Crown size={24} />, title: "Guild com mais pontos vence", desc: "Ao fim do War Day, a guild mais pontuada recebe +10 XP por resposta certa de cada membro!" },
  ];

  return (
    <div className="rounded-2xl border p-6"
      style={{ background: "rgba(15,15,30,0.6)", borderColor: "rgba(255,255,255,0.07)" }}>
      <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
        <Flame size={20} className="text-orange-400" />
        Como funciona o War Day?
      </h3>
      <div className="space-y-4">
        {steps.map((step, i) => (
          <div key={i} className="flex gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-indigo-400"
              style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)" }}>
              {step.icon}
            </div>
            <div>
              <p className="font-semibold text-white text-sm">{step.title}</p>
              <p className="text-gray-500 text-xs mt-0.5">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function WarDayHubPage() {
  const [events, setEvents] = useState<WarDayEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    WarDayService.getUpcoming()
      .then(setEvents)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const activeEvents = events.filter((e) => e.status === "ACTIVE");
  const upcomingEvents = events.filter((e) => e.status === "UPCOMING");
  const finishedEvents = events.filter((e) => e.status === "FINISHED");

  return (
    <div className="min-h-screen pb-12" style={{ background: "radial-gradient(ellipse at top, #0d0520 0%, #050810 40%)" }}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero header */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4 text-xs font-bold uppercase tracking-widest"
            style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#F87171" }}>
            <Flame size={14} />
            Batalha de Guilds
          </div>
          <h1 className="text-5xl font-black text-white mb-3"
            style={{ textShadow: "0 0 40px rgba(239,68,68,0.3)" }}>
            ⚔️ War Day
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Batalhas épicas entre guilds em um mapa interativo. Conquiste zonas, acumule pontos e leve sua guild à glória.
          </p>
        </motion.div>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-64 rounded-2xl" style={{ background: "#111" }} />
            <Skeleton className="h-48 rounded-2xl" style={{ background: "#111" }} />
          </div>
        ) : (
          <div className="space-y-10">
            {/* Active events */}
            {activeEvents.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                  <h2 className="text-lg font-bold text-white">Em Andamento</h2>
                </div>
                <div className="grid gap-4">
                  {activeEvents.map((e) => <WarDayEventCard key={e.id} event={e} />)}
                </div>
              </section>
            )}

            {/* Upcoming */}
            {upcomingEvents.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Calendar size={18} className="text-yellow-400" />
                  Próximos Eventos
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {upcomingEvents.map((e) => <WarDayEventCard key={e.id} event={e} />)}
                </div>
              </section>
            )}

            {/* No events */}
            {activeEvents.length === 0 && upcomingEvents.length === 0 && (
              <div className="rounded-2xl border p-12 text-center"
                style={{ background: "rgba(15,15,30,0.6)", borderColor: "rgba(255,255,255,0.07)" }}>
                <Shield size={48} className="text-gray-700 mx-auto mb-4" />
                <p className="text-gray-400 text-lg font-semibold mb-1">Nenhuma batalha no momento</p>
                <p className="text-gray-600 text-sm">O próximo War Day será anunciado em breve. Fique de olho!</p>
              </div>
            )}

            {/* How it works */}
            <HowItWorksSection />

            {/* Past events */}
            {finishedEvents.length > 0 && (
              <section>
                <h2 className="text-base font-bold text-gray-500 mb-4 flex items-center gap-2">
                  <Trophy size={16} />
                  Batalhas Anteriores
                </h2>
                <div className="grid gap-3 sm:grid-cols-2 opacity-70">
                  {finishedEvents.slice(0, 4).map((e) => <WarDayEventCard key={e.id} event={e} />)}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
