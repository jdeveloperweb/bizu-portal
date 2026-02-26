"use client";

import { useEffect, useState } from "react";
import { Swords, ArrowRight } from "lucide-react";
import { Duel, DuelService } from "@/lib/duelService";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

interface ActiveDuelBannerProps {
    onReturn?: (duelId: string) => void;
}

export default function ActiveDuelBanner({ onReturn }: ActiveDuelBannerProps) {
    const [activeDuel, setActiveDuel] = useState<Duel | null>(null);
    const router = useRouter();
    const { user } = useAuth();

    const userId = user?.sub || user?.id;

    useEffect(() => {
        const checkActiveDuel = async () => {
            try {
                const duel = await DuelService.getActiveDuel();
                setActiveDuel(duel);
            } catch (error) {
                console.error("Failed to check active duel", error);
            }
        };

        checkActiveDuel();

        // Polling if needed, but maybe just on mount is enough for "returning to screen"
        const interval = setInterval(checkActiveDuel, 30000);
        return () => clearInterval(interval);
    }, []);

    if (!activeDuel) return null;

    return (
        <div className="mb-6 animate-in slide-in-from-top duration-500">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-700 p-4 md:p-5 shadow-lg shadow-indigo-100">
                {/* Decorative circles */}
                <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
                <div className="absolute -bottom-4 left-1/4 h-16 w-16 rounded-full bg-white/5 blur-xl" />

                <div className="relative flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4 text-white">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md">
                            <Swords className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-white">Duelo em andamento!</h3>
                            <p className="text-sm text-indigo-100">
                                Você tem um duelo contra <span className="font-semibold">{activeDuel.challenger?.id === userId ? activeDuel.opponent?.name : activeDuel.challenger?.name}</span> em <span className="font-semibold">{activeDuel.subject}</span>.
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            if (onReturn) {
                                onReturn(activeDuel.id);
                            } else {
                                router.push(`/arena?duelId=${activeDuel.id}`);
                            }
                        }}
                        className="group flex w-full md:w-auto items-center justify-center gap-2 rounded-xl bg-white px-6 py-2.5 text-sm font-bold text-indigo-600 transition-all hover:bg-indigo-50 active:scale-95 sm:w-auto"
                    >
                        Retomar Duelo
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </button>
                </div>
            </div>
        </div>
    );
}
