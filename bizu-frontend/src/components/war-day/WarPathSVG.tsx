"use client";

import { useMemo } from "react";
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
        <filter id="pathGlow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="activeGlow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {paths.map((path) => {
        const dx = path.x2 - path.x1;
        const dy = path.y2 - path.y1;
        const midX = path.x1 + dx * 0.5;
        const midY = path.y1 + dy * 0.5;
        // Slight curve for organic feel
        const cx = midX + dy * 0.15;
        const cy = midY - dx * 0.15;
        const d = `M ${path.x1} ${path.y1} Q ${cx} ${cy} ${path.x2} ${path.y2}`;

        return (
          <g key={path.id}>
            {/* Shadow path */}
            <path
              d={d}
              fill="none"
              stroke="rgba(0,0,0,0.5)"
              strokeWidth={path.conquered ? 5 : 3}
              strokeLinecap="round"
            />
            {/* Main path */}
            <path
              d={d}
              fill="none"
              stroke={
                path.conquered
                  ? "#F59E0B"
                  : path.active
                    ? "rgba(148,163,184,0.6)"
                    : "rgba(55,65,81,0.5)"
              }
              strokeWidth={path.conquered ? 4 : 2.5}
              strokeLinecap="round"
              strokeDasharray={path.active && !path.conquered ? "8 6" : undefined}
              filter={path.conquered ? "url(#pathGlow)" : undefined}
            />
            {/* Animated dash for active paths */}
            {path.active && !path.conquered && (
              <path
                d={d}
                fill="none"
                stroke="rgba(245,158,11,0.8)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray="6 24"
                style={{
                  animation: "dashMove 2s linear infinite",
                }}
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
