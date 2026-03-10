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
        <filter id="magicalGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feFlood floodColor="rgba(99,102,241,0.6)" result="color" />
          <feComposite in="color" in2="blur" operator="in" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter id="conqueredGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feFlood floodColor="rgba(245,158,11,0.5)" result="color" />
          <feComposite in="color" in2="blur" operator="in" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <linearGradient id="energyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="transparent" />
          <stop offset="50%" stopColor="white" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>

      {paths.map((path) => {
        const dx = path.x2 - path.x1;
        const dy = path.y2 - path.y1;
        const midX = path.x1 + dx * 0.5;
        const midY = path.y1 + dy * 0.5;
        // Subtle curve for a more organic "unfolding" map feel
        const cx = midX + dy * 0.1;
        const cy = midY - dx * 0.1;
        const d = `M ${path.x1} ${path.y1} Q ${cx} ${cy} ${path.x2} ${path.y2}`;

        return (
          <g key={path.id}>
            {/* Background Path (Dotted/Ghostly) */}
            <path
              d={d}
              fill="none"
              stroke="white"
              strokeWidth="1.5"
              strokeDasharray="4 8"
              opacity="0.05"
            />

            {/* Locked Path */}
            {!path.active && (
              <path
                d={d}
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.1"
              />
            )}

            {/* Active Path Base */}
            {path.active && !path.conquered && (
              <>
                <motion.path
                  d={d}
                  fill="none"
                  stroke="#6366F1"
                  strokeWidth="3"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.4 }}
                  transition={{ duration: 1 }}
                />
                <motion.path
                  d={d}
                  fill="none"
                  stroke="#6366F1"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  filter="url(#magicalGlow)"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.5, delay: 0.2 }}
                />
              </>
            )}

            {/* Conquered Path */}
            {path.conquered && (
              <>
                <path
                  d={d}
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="5"
                  strokeLinecap="round"
                  opacity="0.2"
                />
                <motion.path
                  d={d}
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="2"
                  strokeLinecap="round"
                  filter="url(#conqueredGlow)"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.8 }}
                />
              </>
            )}

            {/* Pulsing Energy Particle */}
            {path.active && !path.conquered && (
              <motion.path
                d={d}
                fill="none"
                stroke="url(#energyGradient)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="50 150"
                animate={{ strokeDashoffset: [200, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                opacity="0.8"
              />
            )}
          </g>
        );
      })}
    </svg>
  );
}
