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
    const result: Array<{
      id: string;
      x1: number; y1: number;
      x2: number; y2: number;
      active: boolean;
      conquered: boolean;
    }> = [];

    const zoneMap = new Map(zones.map((z) => [z.zoneId, z]));

    zones.forEach((zone) => {
      zone.prerequisiteZoneIds?.forEach((prereqId) => {
        const prereq = zoneMap.get(prereqId);
        if (!prereq) return;

        const isActive = zone.status !== "LOCKED" || prereq.status === "CONQUERED";
        const isConquered = zone.status === "CONQUERED" && prereq.status === "CONQUERED";

        result.push({
          id: `${prereqId}-${zone.zoneId}`,
          x1: prereq.positionX * containerWidth,
          y1: prereq.positionY * containerHeight,
          x2: zone.positionX * containerWidth,
          y2: zone.positionY * containerHeight,
          active: isActive,
          conquered: isConquered,
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
        <filter id="pathGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <linearGradient id="activeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(56,189,248,0)" />
          <stop offset="50%" stopColor="rgba(56,189,248,0.8)" />
          <stop offset="100%" stopColor="rgba(56,189,248,0)" />
        </linearGradient>
      </defs>

      {paths.map((path) => {
        const dx = path.x2 - path.x1;
        const dy = path.y2 - path.y1;
        const midX = path.x1 + dx * 0.5;
        const midY = path.y1 + dy * 0.5;
        // More subtle curve
        const cx = midX + dy * 0.08;
        const cy = midY - dx * 0.08;
        const d = `M ${path.x1} ${path.y1} Q ${cx} ${cy} ${path.x2} ${path.y2}`;

        return (
          <g key={path.id}>
            {/* Base Path (Locked/Inactive) */}
            <path
              d={d}
              fill="none"
              stroke={path.conquered ? "rgba(245,158,11,0.2)" : "rgba(99,102,241,0.1)"}
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            {/* Active/Conquered Highlight */}
            {(path.active || path.conquered) && (
              <motion.path
                d={d}
                fill="none"
                stroke={path.conquered ? "#F59E0B" : "#6366F1"}
                strokeWidth={path.conquered ? "2.5" : "1.5"}
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                filter="url(#pathGlow)"
              />
            )}
            {/* Energy Flow Animation */}
            {path.active && !path.conquered && (
              <motion.path
                d={d}
                fill="none"
                stroke="url(#activeGradient)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray="40 120"
                animate={{ strokeDashoffset: [-160, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />
            )}
          </g>
        );
      })}

      <style>{`
        @keyframes dashMove {
          to { stroke-dashoffset: -30; }
        }
      `}</style>
    </svg>
  );
}
