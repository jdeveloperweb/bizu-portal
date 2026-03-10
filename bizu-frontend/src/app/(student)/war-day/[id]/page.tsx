"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { WarDayProvider, useWarDay } from "@/contexts/WarDayContext";
import WarMap from "@/components/war-day/WarMap";
import WarDayHUD from "@/components/war-day/WarDayHUD";
import GuildRankingPanel from "@/components/war-day/GuildRankingPanel";
import ZoneBattleScreen from "@/components/war-day/ZoneBattleScreen";
import BossZoneScreen from "@/components/war-day/BossZoneScreen";
import { ZoneState, AnswerResult } from "@/lib/warDayService";
import { useAuth } from "@/components/AuthProvider";
import { Swords, Users, ArrowLeft, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

// ─── Inner content (inside WarDayProvider) ────────────────────────────────────

function WarDayMapContent({ eventId }: { eventId: string }) {
  const { event, mapState, ranking, loading, error, loadEvent, joinEvent, refreshMap, timeRemaining } = useWarDay();
  const { user } = useAuth();
  const router = useRouter();

  const [activeBattle, setActiveBattle] = useState<ZoneState | null>(null);
  const [showRanking, setShowRanking] = useState(false);

  useEffect(() => { loadEvent(eventId); }, [loadEvent, eventId]);

  const handleZoneClick = useCallback((zone: ZoneState) => {
    setActiveBattle(zone);
  }, []);

  const handleBattleBack = useCallback(() => {
    setActiveBattle(null);
    refreshMap(eventId);
  }, [refreshMap, eventId]);

  const handleZoneConquered = useCallback((_result: AnswerResult) => {
    setActiveBattle(null);
    refreshMap(eventId);
  }, [refreshMap, eventId]);

  if (loading) {
    return (
      <div className="flex flex-col gap-4 p-4 min-h-screen"
        style={{ background: "#050810" }}>
        <Skeleton className="h-14 w-full rounded-none" style={{ background: "#111" }} />
        <Skeleton className="flex-1 rounded-2xl" style={{ background: "#0d1220", minHeight: 400 }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4"
        style={{ background: "#050810", color: "white" }}>
        <AlertCircle size={40} className="text-red-400" />
        <p className="text-red-400 font-semibold">{error}</p>
        <Link href="/war-day" className="text-indigo-400 hover:underline">
          ← Voltar aos eventos
        </Link>
      </div>
    );
  }

  if (!event) return null;

  // If guild hasn't joined
  if (!mapState && event.status === "ACTIVE") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-4"
        style={{ background: "radial-gradient(ellipse at top, #1a0a2e, #050810)", color: "white" }}>
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: "rgba(239,68,68,0.15)", border: "2px solid rgba(239,68,68,0.4)" }}>
            <Swords size={44} className="text-red-400" />
          </div>
          <h1 className="text-4xl font-black mb-2"
            style={{ background: "linear-gradient(135deg, #F87171, #F59E0B)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            {event.title}
          </h1>
          <p className="text-gray-400 mb-8 max-w-md">
            {event.description ?? "Sua guild está sendo convocada para a guerra! Conquiste zonas, acumule pontos e leve sua guild à vitória."}
          </p>
          <button
            onClick={() => joinEvent(eventId)}
            className="flex items-center gap-3 px-10 py-4 rounded-2xl font-black text-xl text-white transition-all hover:scale-105 active:scale-95 mx-auto"
            style={{
              background: "linear-gradient(135deg, #7F1D1D, #EF4444)",
              boxShadow: "0 0 40px rgba(239,68,68,0.4)",
            }}
          >
            <Swords size={24} />
            Entrar na Guerra!
          </button>
          <p className="text-gray-600 text-sm mt-4">
            <Users size={14} className="inline mr-1" />
            {ranking.length} guilds já em batalha
          </p>
        </motion.div>
      </div>
    );
  }

  if (event.status === "UPCOMING") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4"
        style={{ background: "#050810", color: "white" }}>
        <h1 className="text-2xl font-bold">{event.title}</h1>
        <p className="text-gray-400">O War Day ainda não começou.</p>
        <p className="text-indigo-400 text-sm">Início: {new Date(event.startAt).toLocaleString("pt-BR")}</p>
        <Link href="/war-day" className="text-gray-500 hover:text-white text-sm">← Voltar</Link>
      </div>
    );
  }

  // Active battle
  if (activeBattle) {
    if (activeBattle.zoneType === "BOSS") {
      return (
        <BossZoneScreen
          eventId={eventId}
          zone={activeBattle}
          onBack={handleBattleBack}
          onBossDefeated={handleZoneConquered}
        />
      );
    }
    return (
      <ZoneBattleScreen
        eventId={eventId}
        zone={activeBattle}
        onBack={handleBattleBack}
        onZoneConquered={handleZoneConquered}
      />
    );
  }

  // Main map view
  return (
    <div className="flex flex-col min-h-screen" style={{ background: "#050810" }}>
      {/* HUD */}
      {event && (
        <WarDayHUD
          event={event}
          mapState={mapState}
          timeRemaining={timeRemaining}
          participantCount={ranking.length}
          onToggleRanking={() => setShowRanking((v) => !v)}
          showRanking={showRanking}
        />
      )}

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden" style={{ minHeight: 0 }}>
        {/* Map */}
        <div className="flex-1 relative p-3" style={{ minHeight: 480 }}>
          {mapState && (
            <WarMap
              zones={mapState.zones}
              onZoneClick={handleZoneClick}
              guildName={mapState.guildName}
              totalScore={mapState.totalScore}
            />
          )}
          {!mapState && event.status === "FINISHED" && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-gray-400 text-lg font-semibold mb-2">War Day encerrado</p>
                <p className="text-gray-600 text-sm mb-4">Verifique o ranking final</p>
                <button onClick={() => setShowRanking(true)}
                  className="px-6 py-2 bg-indigo-600 rounded-xl text-white text-sm hover:bg-indigo-500 transition-colors">
                  Ver Ranking
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Ranking panel (sidebar on desktop) */}
        <AnimatePresence>
          {showRanking && (
            <motion.div
              className="w-72 border-l flex-shrink-0 hidden lg:flex flex-col"
              style={{
                background: "rgba(0,0,0,0.6)",
                borderColor: "rgba(255,255,255,0.08)",
              }}
              initial={{ x: 288, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 288, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <GuildRankingPanel
                ranking={ranking}
                myGuildId={mapState?.guildId}
                onClose={() => setShowRanking(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile ranking drawer */}
      <AnimatePresence>
        {showRanking && (
          <motion.div
            className="fixed inset-0 z-40 flex flex-col justify-end lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowRanking(false)}
          >
            <div className="absolute inset-0 bg-black/50" />
            <motion.div
              className="relative rounded-t-2xl border-t"
              style={{
                background: "rgba(15,15,30,0.97)",
                borderColor: "rgba(255,255,255,0.1)",
                maxHeight: "60vh",
                overflow: "hidden",
              }}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-10 h-1 bg-gray-600 rounded-full mx-auto mt-3 mb-1" />
              <div className="overflow-y-auto" style={{ maxHeight: "calc(60vh - 24px)" }}>
                <GuildRankingPanel
                  ranking={ranking}
                  myGuildId={mapState?.guildId}
                  onClose={() => setShowRanking(false)}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Page with provider ───────────────────────────────────────────────────────

export default function WarDayMapPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <WarDayProvider eventId={id}>
      <WarDayMapContent eventId={id} />
    </WarDayProvider>
  );
}
