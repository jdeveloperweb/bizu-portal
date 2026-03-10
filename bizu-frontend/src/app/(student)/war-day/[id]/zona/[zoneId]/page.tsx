"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { WarDayProvider, useWarDay } from "@/contexts/WarDayContext";
import ZoneBattleScreen from "@/components/war-day/ZoneBattleScreen";
import BossZoneScreen from "@/components/war-day/BossZoneScreen";
import { ZoneState, AnswerResult } from "@/lib/warDayService";

function ZonePageContent({ eventId, zoneId }: { eventId: string; zoneId: string }) {
  const { mapState, loading, loadEvent, getZoneById } = useWarDay();
  const router = useRouter();
  const [zone, setZone] = useState<ZoneState | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    loadEvent(eventId);
  }, [loadEvent, eventId]);

  useEffect(() => {
    if (!loading && mapState) {
      const found = getZoneById(zoneId);
      if (found) {
        setZone(found);
      } else {
        setNotFound(true);
      }
    }
    // If not loading and no mapState, guild hasn't joined — redirect
    if (!loading && !mapState) {
      router.replace(`/war-day/${eventId}`);
    }
  }, [loading, mapState, getZoneById, zoneId, eventId, router]);

  const handleBack = () => router.push(`/war-day/${eventId}`);
  const handleDone = (_result: AnswerResult) => router.push(`/war-day/${eventId}`);

  if (loading || (!zone && !notFound)) {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{ background: "radial-gradient(ellipse at top, #1a0a2e, #050810)" }}
      >
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-12 h-12 rounded-full border-2 border-red-500 border-t-transparent animate-spin"
          />
          <p className="text-gray-400 text-sm">Carregando zona...</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-screen gap-4"
        style={{ background: "#050810" }}
      >
        <p className="text-gray-400">Zona não encontrada ou bloqueada.</p>
        <button
          onClick={handleBack}
          className="text-indigo-400 hover:underline text-sm"
        >
          ← Voltar ao Mapa
        </button>
      </div>
    );
  }

  if (zone!.zoneType === "BOSS") {
    return (
      <BossZoneScreen
        eventId={eventId}
        zone={zone!}
        onBack={handleBack}
        onBossDefeated={handleDone}
      />
    );
  }

  return (
    <ZoneBattleScreen
      eventId={eventId}
      zone={zone!}
      onBack={handleBack}
      onZoneConquered={handleDone}
    />
  );
}

export default function ZonePage() {
  const { id, zoneId } = useParams<{ id: string; zoneId: string }>();

  return (
    <WarDayProvider eventId={id}>
      <ZonePageContent eventId={id} zoneId={zoneId} />
    </WarDayProvider>
  );
}
