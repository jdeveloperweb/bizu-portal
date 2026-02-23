"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface FlashcardProps {
    front: string;
    back: string;
}

export default function FlashcardItem({ front, back }: FlashcardProps) {
    const [isFlipped, setIsFlipped] = useState(false);

    return (
        <div
            className="perspective-1000 w-full h-[400px] cursor-pointer"
            onClick={() => setIsFlipped(!isFlipped)}
        >
            <motion.div
                className="relative w-full h-full transition-all duration-500 preserve-3d"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
                {/* Front */}
                <div className="absolute inset-0 w-full h-full backface-hidden bg-card border-2 border-primary/20 rounded-[40px] p-10 flex flex-col items-center justify-center text-center shadow-xl">
                    <div className="absolute top-8 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-widest text-primary/50">
                        FRENTE
                    </div>
                    <p className="text-2xl font-bold leading-relaxed">{front}</p>
                    <p className="absolute bottom-8 text-xs font-medium text-muted-foreground">Clique para ver a resposta</p>
                </div>

                {/* Back */}
                <div
                    className="absolute inset-0 w-full h-full backface-hidden bg-primary text-primary-foreground rounded-[40px] p-10 flex flex-col items-center justify-center text-center shadow-xl"
                    style={{ transform: "rotateY(180deg)" }}
                >
                    <div className="absolute top-8 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-widest opacity-50">
                        VERSO
                    </div>
                    <p className="text-2xl font-medium leading-relaxed">{back}</p>
                    <p className="absolute bottom-8 text-xs font-medium opacity-70">Clique para voltar</p>
                </div>
            </motion.div>
        </div>
    );
}
