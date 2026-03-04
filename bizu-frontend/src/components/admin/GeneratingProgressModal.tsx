"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, CheckCircle2, XCircle, StopCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";

interface Props {
    materialId: string;
    moduleId: string;
    moduleName: string;
    materialTitle: string;
    count: number;
    category: "QUIZ" | "SIMULADO";
    onClose: () => void;
    onComplete: (totalGenerated: number) => void;
}

type Status = "generating" | "complete" | "partial" | "error";

export default function GeneratingProgressModal({
    materialId,
    moduleId,
    moduleName,
    materialTitle,
    count,
    category,
    onClose,
    onComplete,
}: Props) {
    const [status, setStatus] = useState<Status>("generating");
    const [currentChunk, setCurrentChunk] = useState(0);
    const [totalChunks, setTotalChunks] = useState(1);
    const [questionsGenerated, setQuestionsGenerated] = useState(0);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        let cancelled = false;

        const run = async () => {
            try {
                const params = new URLSearchParams({
                    perChunk: count.toString(),
                    category,
                    moduleId,
                    moduleName,
                });

                const response = await apiFetch(
                    `/admin/materials/${materialId}/generate-questions?${params.toString()}`,
                    { headers: { Accept: "text/event-stream" } }
                );

                if (!response.ok) {
                    setStatus("error");
                    setErrorMessage(
                        "Erro ao iniciar geração. Verifique se a AI_API_KEY está configurada no servidor."
                    );
                    return;
                }

                const reader = response.body?.getReader();
                if (!reader) {
                    setStatus("error");
                    setErrorMessage("Stream de dados não disponível.");
                    return;
                }

                const decoder = new TextDecoder();
                let buffer = "";

                while (!cancelled) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    buffer += decoder.decode(value, { stream: true });

                    // SSE messages are separated by double newlines
                    const rawEvents = buffer.split("\n\n");
                    buffer = rawEvents.pop() ?? "";

                    for (const rawEvent of rawEvents) {
                        let eventType = "message";
                        let data = "";

                        for (const line of rawEvent.split("\n")) {
                            if (line.startsWith("event:")) eventType = line.slice(6).trim();
                            if (line.startsWith("data:")) data = line.slice(5).trim();
                        }

                        if (!data) continue;

                        try {
                            const parsed = JSON.parse(data);
                            if (eventType === "start") {
                                setTotalChunks(parsed.totalChunks ?? 1);
                                // perChunk available as parsed.perChunk if needed
                            } else if (eventType === "progress") {
                                setCurrentChunk(parsed.chunk ?? 0);
                                setQuestionsGenerated(parsed.questionsGenerated ?? 0);
                            } else if (eventType === "complete") {
                                const total = parsed.totalGenerated ?? 0;
                                setQuestionsGenerated(total);
                                setStatus("complete");
                                onComplete(total);
                            } else if (eventType === "error") {
                                setStatus("error");
                                setErrorMessage(parsed.message ?? "Erro desconhecido.");
                            }
                        } catch {
                            // Ignore malformed SSE events
                        }
                    }
                }
            } catch (err: unknown) {
                if (!cancelled) {
                    setStatus("error");
                    setErrorMessage(
                        err instanceof Error ? err.message : "Erro de conexão com o servidor."
                    );
                }
            }
        };

        run();
        return () => {
            cancelled = true;
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const progress = totalChunks > 0 ? Math.round((currentChunk / totalChunks) * 100) : 0;

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl"
            />

            <motion.div
                initial={{ scale: 0.9, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                className="bg-white w-full max-w-md rounded-2xl p-10 shadow-2xl relative z-10 text-center"
            >
                {/* ── Generating ─────────────────────────────────────────── */}
                {status === "generating" && (
                    <>
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center mx-auto mb-6">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            >
                                <Sparkles className="w-8 h-8 text-violet-600" />
                            </motion.div>
                        </div>

                        <h2 className="text-xl font-black text-slate-800 mb-1">Gerando questões com IA...</h2>
                        <p className="text-slate-400 font-medium text-sm mb-8 truncate">{materialTitle}</p>

                        {/* Progress section */}
                        <div className="space-y-4 text-left">
                            <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                <span>
                                    Trecho {currentChunk} de {totalChunks}
                                </span>
                                <span>{progress}%</span>
                            </div>

                            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full"
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 0.6, ease: "easeOut" }}
                                    style={{ width: `${progress}%` }}
                                />
                            </div>

                            <div className="flex items-center justify-between pt-1">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
                                    <span className="text-sm font-bold text-slate-600">
                                        {questionsGenerated}{" "}
                                        {questionsGenerated === 1 ? "questão gerada" : "questões geradas"}
                                    </span>
                                </div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    {category === "SIMULADO" ? "Simulado" : "Quiz"}
                                </span>
                            </div>
                        </div>

                        <p className="text-xs text-slate-300 font-medium mt-8 leading-relaxed">
                            Não feche esta janela. O processo pode levar alguns minutos dependendo do tamanho do artigo.
                        </p>
                    </>
                )}

                {/* ── Complete ────────────────────────────────────────────── */}
                {status === "complete" && (
                    <>
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 12 }}
                            className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6"
                        >
                            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                        </motion.div>

                        <h2 className="text-xl font-black text-slate-800 mb-3">Geração concluída!</h2>
                        <p className="text-slate-400 font-medium text-sm mb-1">
                            <span className="text-emerald-600 font-black text-4xl block mb-1">{questionsGenerated}</span>
                            {questionsGenerated === 1 ? "questão gerada" : "questões geradas"} com sucesso
                        </p>
                        <p className="text-slate-400 text-xs mb-8">
                            Módulo: <strong className="text-slate-600">{moduleName}</strong>
                        </p>

                        <Button
                            onClick={onClose}
                            className="w-full h-12 rounded-xl font-black bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                            Fechar
                        </Button>
                    </>
                )}

                {/* ── Error ───────────────────────────────────────────────── */}
                {status === "error" && (
                    <>
                        <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
                            <XCircle className="w-10 h-10 text-red-500" />
                        </div>

                        <h2 className="text-xl font-black text-slate-800 mb-2">Erro na geração</h2>
                        <p className="text-red-500 font-medium text-sm mb-8 bg-red-50 rounded-xl p-4 text-left leading-relaxed">
                            {errorMessage}
                        </p>

                        <Button
                            onClick={onClose}
                            variant="outline"
                            className="w-full h-12 rounded-xl font-black border-red-200 text-red-500 hover:bg-red-50"
                        >
                            Fechar
                        </Button>
                    </>
                )}
            </motion.div>
        </div>
    );
}
