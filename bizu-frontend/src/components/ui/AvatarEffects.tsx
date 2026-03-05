"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

interface VisualMetadata {
    auraColor?: string;
    auraStyle?: "steady" | "pulse" | "glitch";
    glowSize?: number;
    particles?: "snow" | "sparks" | "coins" | "hearts";
    borderStyle?: "solid" | "rainbow" | "pulse";
    animation?: "spin" | "none";
}

interface AvatarEffectsProps {
    metadata?: VisualMetadata;
    size: "sm" | "md" | "lg" | "xl";
}

export function AvatarEffects({ metadata, size }: AvatarEffectsProps) {
    if (!metadata) return null;

    const particleCount = size === "xl" ? 20 : 10;

    // Generate particles
    const particles = useMemo(() => {
        if (!metadata.particles) return [];
        return Array.from({ length: particleCount }).map((_, i) => ({
            id: i,
            x: Math.random() * 100,
            delay: Math.random() * 5,
            duration: 2 + Math.random() * 3,
            size: 2 + Math.random() * 4
        }));
    }, [metadata.particles, particleCount]);

    const renderParticles = () => {
        if (!metadata.particles) return null;

        return (
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[inherit] z-[5]">
                {particles.map((p) => (
                    <motion.div
                        key={p.id}
                        initial={{ y: -10, x: `${p.x}%`, opacity: 0 }}
                        animate={{
                            y: ["0%", "110%"],
                            opacity: [0, 1, 1, 0]
                        }}
                        transition={{
                            duration: p.duration,
                            repeat: Infinity,
                            delay: p.delay,
                            ease: "linear"
                        }}
                        style={{
                            position: "absolute",
                            width: p.size,
                            height: p.size,
                            backgroundColor: metadata.particles === "snow" ? "white" :
                                metadata.particles === "sparks" ? metadata.auraColor || "#fbbf24" :
                                    "transparent",
                            borderRadius: "50%",
                            boxShadow: metadata.particles === "sparks" ? `0 0 5px ${metadata.auraColor}` : "none",
                            display: metadata.particles === "coins" || metadata.particles === "hearts" ? "flex" : "block",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: p.size * 2
                        }}
                    >
                        {metadata.particles === "coins" && "💰"}
                        {metadata.particles === "hearts" && "❤️"}
                    </motion.div>
                ))}
            </div>
        );
    };

    return (
        <>
            {/* Background Aura Glow */}
            {metadata.auraColor && (
                <motion.div
                    className="absolute inset-[-4px] rounded-[inherit] z-[-1] blur-md opacity-40"
                    animate={metadata.auraStyle === "pulse" ? {
                        scale: [1, 1.15, 1],
                        opacity: [0.3, 0.6, 0.3]
                    } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{
                        backgroundColor: metadata.auraColor,
                        filter: `blur(${metadata.glowSize || 8}px)`
                    }}
                />
            )}

            {/* Particle Layer */}
            {renderParticles()}

            {/* Glitch Overlay if active */}
            {metadata.auraStyle === "glitch" && (
                <motion.div
                    className="absolute inset-0 bg-white/10 z-[15] pointer-events-none"
                    animate={{
                        opacity: [0, 0.2, 0, 0.1, 0],
                        x: [0, -2, 2, -1, 0]
                    }}
                    transition={{ duration: 0.2, repeat: Infinity, repeatDelay: Math.random() * 5 }}
                />
            )}
        </>
    );
}
