"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { ZoneState } from "@/lib/warDayService";

interface WarPathSVGProps {
  zones: ZoneState[];
  containerWidth: number;
  containerHeight: number;
}

export default function WarPathSVG({ zones, containerWidth, containerHeight }: WarPathSVGProps) {
  const paths = useMemo(() => {
    const zoneMap = new Map(zones.map((z) => [z.zoneId, z]));
    const result: Array<{
      id: string;
      d: string;
      active: boolean;
      conquered: boolean;
      length: number;
    }> = [];

    zones.forEach((zone) => {
      zone.prerequisiteZoneIds?.forEach((prereqId) => {
        const prereq = zoneMap.get(prereqId);
        if (!prereq) return;

        const x1 = prereq.positionX * containerWidth;
        const y1 = prereq.positionY * containerHeight;
        const x2 = zone.positionX * containerWidth;
        const y2 = zone.positionY * containerHeight;
        const dx = x2 - x1;
        const dy = y2 - y1;
        const cx = x1 + dx * 0.5 + dy * 0.18;
        const cy = y1 + dy * 0.5 - dx * 0.18;

        result.push({
          id: `${prereqId}-${zone.zoneId}`,
          d: `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`,
          active: zone.status !== "LOCKED" || prereq.status === "CONQUERED",
          conquered: zone.status === "CONQUERED" && prereq.status === "CONQUERED",
          length: Math.hypot(dx, dy) * 1.2,
        });
      });
    });

    return result;
  }, [zones, containerWidth, containerHeight]);

  if (!containerWidth || !containerHeight) return null;

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      width={containerWidth}
      height={containerHeight}
      style={{ zIndex: 1 }}
    >
      <defs>
        {/* Arcane purple glow */}
        <filter id="pf-arcane" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="5" result="b" />
          <feFlood floodColor="#7C3AED" floodOpacity="1" result="c" />
          <feComposite in="c" in2="b" operator="in" result="g" />
          <feMerge>
            <feMergeNode in="g" />
            <feMergeNode in="g" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {/* Gold conquest glow */}
        <filter id="pf-gold" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="7" result="b" />
          <feFlood floodColor="#F59E0B" floodOpacity="1" result="c" />
          <feComposite in="c" in2="b" operator="in" result="g" />
          <feMerge>
            <feMergeNode in="g" />
            <feMergeNode in="g" />
            <feMergeNode in="g" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {paths.map((p, i) => (
        <g key={p.id}>
          {/* ── LOCKED ── */}
          {!p.active && (
            <>
              <path
                d={p.d} fill="none" stroke="#0A0618" strokeWidth="12"
                strokeLinecap="round" opacity="0.9"
              />
              <path
                d={p.d} fill="none" stroke="#2D1F6E" strokeWidth="2"
                strokeDasharray="5 16" strokeLinecap="round" opacity="0.45"
              />
            </>
          )}

          {/* ── ACTIVE (not conquered) ── */}
          {p.active && !p.conquered && (
            <>
              {/* Far outer ambient glow */}
              <path
                d={p.d} fill="none" stroke="#3730A3" strokeWidth="22"
                strokeLinecap="round" opacity="0.18"
                filter="url(#pf-arcane)"
              />
              {/* Wide base channel */}
              <path
                d={p.d} fill="none" stroke="#1E1B4B" strokeWidth="12"
                strokeLinecap="round" opacity="0.7"
              />
              {/* Mid glow */}
              <path
                d={p.d} fill="none" stroke="#5B21B6" strokeWidth="6"
                strokeLinecap="round" opacity="0.75"
              />
              {/* Bright core — entrance animation */}
              <motion.path
                d={p.d} fill="none" stroke="#C4B5FD" strokeWidth="2"
                strokeLinecap="round"
                filter="url(#pf-arcane)"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.95 }}
                transition={{ duration: 1.6, delay: i * 0.08, ease: "easeOut" }}
              />
              {/* Traveling energy bolt 1 */}
              <motion.path
                d={p.d} fill="none" stroke="rgba(196,181,253,0.9)" strokeWidth="7"
                strokeLinecap="round"
                strokeDasharray={`18 ${Math.max(p.length, 1)}`}
                animate={{ strokeDashoffset: [0, -(p.length + 18)] }}
                transition={{ duration: 2.6, repeat: Infinity, ease: "linear", delay: i * 0.3 }}
                filter="url(#pf-arcane)"
              />
              {/* Traveling energy bolt 2 — offset */}
              <motion.path
                d={p.d} fill="none" stroke="rgba(167,139,250,0.6)" strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`10 ${Math.max(p.length, 1)}`}
                animate={{ strokeDashoffset: [0, -(p.length + 10)] }}
                transition={{ duration: 2.6, repeat: Infinity, ease: "linear", delay: i * 0.3 + 1.3 }}
              />
            </>
          )}

          {/* ── CONQUERED ── */}
          {p.conquered && (
            <>
              {/* Far outer gold halo */}
              <path
                d={p.d} fill="none" stroke="#78350F" strokeWidth="26"
                strokeLinecap="round" opacity="0.22"
                filter="url(#pf-gold)"
              />
              {/* Wide golden channel */}
              <path
                d={p.d} fill="none" stroke="#92400E" strokeWidth="14"
                strokeLinecap="round" opacity="0.55"
              />
              {/* Mid amber glow */}
              <path
                d={p.d} fill="none" stroke="#D97706" strokeWidth="7"
                strokeLinecap="round" opacity="0.8"
              />
              {/* Bright gold core — entrance */}
              <motion.path
                d={p.d} fill="none" stroke="#FDE68A" strokeWidth="2.5"
                strokeLinecap="round"
                filter="url(#pf-gold)"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.0, ease: "easeOut" }}
              />
              {/* Traveling gold sparkle 1 */}
              <motion.path
                d={p.d} fill="none" stroke="rgba(253,230,138,0.98)" strokeWidth="9"
                strokeLinecap="round"
                strokeDasharray={`14 ${Math.max(p.length, 1)}`}
                animate={{ strokeDashoffset: [0, -(p.length + 14)] }}
                transition={{ duration: 2.0, repeat: Infinity, ease: "linear", delay: i * 0.22 }}
                filter="url(#pf-gold)"
              />
              {/* Traveling gold sparkle 2 — smaller trail */}
              <motion.path
                d={p.d} fill="none" stroke="rgba(251,191,36,0.7)" strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={`8 ${Math.max(p.length, 1)}`}
                animate={{ strokeDashoffset: [0, -(p.length + 8)] }}
                transition={{ duration: 2.0, repeat: Infinity, ease: "linear", delay: i * 0.22 + 1.0 }}
              />
            </>
          )}
        </g>
      ))}
    </svg>
  );
}
