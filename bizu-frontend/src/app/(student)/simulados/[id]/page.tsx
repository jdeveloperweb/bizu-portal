"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import QuestionViewer from "@/components/questions/QuestionViewer";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, Target, Maximize, CheckCircle2 } from "lucide-react";

export default function SimuladoProvaPage() {
    const params = useParams();
    const router = useRouter();
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://bizu.mjoinix.com.br/api/v1";
    const simuladoId = params.id as string;

    const [simulado, setSimulado] = useState<any>(null);
    const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [cheatWarning, setCheatWarning] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Fetch Data
    useEffect(() => {
        const fetchSimulado = async () => {
            setIsLoading(true);
            try {
                const res = await apiFetch(`/simulados/${simuladoId}`);
                if (res.ok) {
                    const data = await res.json();
                    setSimulado(data);
                }
            } catch (error) {
                console.error("Failed to fetch exam", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (simuladoId) {
            fetchSimulado();
        }
    }, [simuladoId]);

    // Anti-cheat & Fullscreen
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden && !isFinished && !isLoading) {
                setCheatWarning(true);
            }
        };

        const handleBlur = () => {
            if (!isFinished && !isLoading) {
                setCheatWarning(true);
            }
        };

        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("blur", handleBlur);
        document.addEventListener("fullscreenchange", handleFullscreenChange);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("blur", handleBlur);
            document.removeEventListener("fullscreenchange", handleFullscreenChange);
            // Salir do modo fullscreen caso desmonte
            if (document.fullscreenElement) {
                document.exitFullscreen().catch(err => console.log(err));
            }
        };
    }, [simuladoId, isFinished, isLoading]);

    const requestFullscreen = () => {
        if (containerRef.current) {
            containerRef.current.requestFullscreen().catch(err => {
                console.error("Erro ao entrar em tela cheia", err);
            });
        }
    };

    const handleNext = () => {
        if (simulado && currentQuestionIdx < simulado.questions.length - 1) {
            setCurrentQuestionIdx(currentQuestionIdx + 1);
        } else {
            setIsFinished(true);
        }
    };

    const handleFinish = () => {
        if (document.fullscreenElement) {
            document.exitFullscreen().catch(err => console.log(err));
        }
        router.push("/simulados");
    };

    if (isLoading) {
        return <div className="p-8 text-center text-muted-foreground flex items-center justify-center min-h-screen">Carregando prova...</div>;
    }

    if (!simulado || !simulado.questions || simulado.questions.length === 0) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center bg-card p-12 rounded-3xl border border-muted shadow-sm">
                    <h2 className="text-xl font-bold mb-4">Nenhuma questão encontrada no simulado</h2>
                    <Button onClick={() => router.push("/simulados")}>Voltar</Button>
                </div>
            </div>
        );
    }

    if (isFinished) {
        return (
            <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-screen">
                <div className="text-center bg-white p-12 rounded-3xl border border-emerald-100 shadow-xl max-w-lg w-full">
                    <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 size={40} />
                    </div>
                    <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Simulado Finalizado!</h2>
                    <p className="text-slate-500 mb-8">Você concluiu todas as questões. Seu resultado já foi salvo.</p>
                    <Button className="w-full" onClick={handleFinish}>Ver meu Desempenho</Button>
                </div>
            </div>
        );
    }

    const currentQuestion = simulado.questions[currentQuestionIdx];

    const formattedOptions = currentQuestion.options ? Object.entries(currentQuestion.options).map(([key, value]) => ({
        id: key,
        text: value as string,
    })) : [];

    const mappedQuestion = currentQuestion ? {
        id: currentQuestion.id,
        statement: currentQuestion.statement || "Questão sem enunciado",
        options: formattedOptions,
        correctOptionId: currentQuestion.correctOption,
        resolution: currentQuestion.resolution || "Resolução não disponível.",
        banca: currentQuestion.banca,
        year: currentQuestion.year,
        subject: currentQuestion.module?.title || currentQuestion.subject || "Geral",
    } : null;

    if (!mappedQuestion) return null;

    return (
        <div ref={containerRef} className="bg-slate-50 min-h-screen w-full relative font-sans text-slate-800">
            {/* Anti-cheat Warning Modal */}
            {cheatWarning && (
                <div className="absolute inset-0 z-[9999] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center border-t-4 border-red-500">
                        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-5">
                            <AlertTriangle size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Aviso de Violação (Anti-Cheat)</h3>
                        <p className="text-sm text-slate-600 mb-6">
                            Você saiu da tela da prova ou perdeu o foco da janela. Em uma aplicação real, isso pode anular seu simulado. Por favor, mantenha o foco na prova!
                        </p>
                        <Button
                            className="bg-slate-900 text-white w-full"
                            onClick={() => {
                                setCheatWarning(false);
                                requestFullscreen();
                            }}
                        >
                            Entendi, voltar para prova
                        </Button>
                    </div>
                </div>
            )}

            {/* Strict Exam Top Bar */}
            <div className="bg-slate-900 text-slate-100 px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-md">
                <div className="flex items-center gap-3">
                    <div className="bg-indigo-500/20 text-indigo-300 p-2 rounded-lg">
                        <Target size={20} />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold uppercase tracking-widest text-indigo-400">Modo Prova</h1>
                        <p className="text-xs text-slate-400 font-medium truncate max-w-[200px] md:max-w-md">{simulado.title}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {!isFullscreen && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="text-xs border-slate-700 bg-slate-800 hover:bg-slate-700 hover:text-white"
                            onClick={requestFullscreen}
                        >
                            <Maximize size={14} className="mr-2" />
                            Tela Cheia
                        </Button>
                    )}
                    <div className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-xl border border-slate-700">
                        <span className="text-xs font-bold text-slate-400">Questão</span>
                        <span className="text-sm font-black text-white">{currentQuestionIdx + 1} / {simulado.questions.length}</span>
                    </div>
                </div>
            </div>

            {/* Exam Content Area */}
            <div className="max-w-4xl mx-auto py-8 px-4 h-[calc(100vh-80px)] overflow-y-auto custom-scrollbar pb-24">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-10">
                    {/* Reusing QuestionViewer inside the sleek container */}
                    <div key={mappedQuestion.id}>
                        <QuestionViewer {...mappedQuestion} onNext={handleNext} isSimuladoMode={true} />
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: #cbd5e1;
                    border-radius: 20px;
                }
            `}</style>
        </div>
    );
}
