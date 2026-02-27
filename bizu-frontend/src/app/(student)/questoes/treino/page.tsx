"use client";

import QuestionViewer from "@/components/questions/QuestionViewer";
import PageHeader from "@/components/PageHeader";
import { Timer, LayoutGrid, ChevronLeft, Sparkles, SlidersHorizontal, ChevronDown, Settings, Maximize, Minimize, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuCheckboxItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense, useMemo, useRef } from "react";
import { apiFetch } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/components/AuthProvider";

interface Module {
    id: string;
    title: string;
}

interface Course {
    id: string;
    title: string;
    modules: Module[];
}

interface QuizQuestion {
    id: string;
    statement: string;
    options: Record<string, string>;
    correctOption: string;
    resolution?: string;
    banca?: string;
    year?: number | string;
    subject?: string;
    module?: {
        id: string;
        title: string;
    };
}

interface SimuladoData {
    id?: string;
    title: string;
    description?: string;
    questions: QuizQuestion[];
}

function TreinoContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const simuladoId = searchParams.get("simulado");
    const { selectedCourseId, isFree } = useAuth();

    const [simulado, setSimulado] = useState<SimuladoData | null>(null);
    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedModuleIds, setSelectedModuleIds] = useState<string[]>([]);
    const [questionCount, setQuestionCount] = useState(isFree ? 10 : 10);
    const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isApplyingConfig, setIsApplyingConfig] = useState(false);
    const [isFocusMode, setIsFocusMode] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener("fullscreenchange", handleFullscreenChange);
        return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
    }, []);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen().catch(err => {
                console.error(`Error: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    };

    const modules = useMemo(
        () => {
            if (!selectedCourseId) return [];
            const selectedCourse = courses.find((c) => c.id === selectedCourseId);
            return selectedCourse?.modules || [];
        },
        [courses, selectedCourseId]
    );

    const selectedModulesText = useMemo(() => {
        if (selectedModuleIds.length === 0) return "Todos os módulos";
        if (selectedModuleIds.length === 1) {
            return modules.find(m => m.id === selectedModuleIds[0])?.title || "1 módulo selecionado";
        }
        return `${selectedModuleIds.length} módulos selecionados`;
    }, [selectedModuleIds, modules]);

    const fetchSimulado = async (count = questionCount) => {
        setIsLoading(true);
        try {
            let url = `/simulados/quiz/rapido?count=${count}`;

            // Se existem módulos selecionados, passamos para o backend para uma busca otimizada
            if (selectedModuleIds.length > 0) {
                url += `&moduleIds=${selectedModuleIds.join(",")}`;
            }

            if (simuladoId) {
                url = `/simulados/${simuladoId}`;
            }
            const res = await apiFetch(url);
            if (res.ok) {
                const data = await res.json();
                setSimulado(data);
                setCurrentQuestionIdx(0);
            }
        } catch (error) {
            console.error("Failed to fetch practice exam", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSimulado(questionCount);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [simuladoId]);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await apiFetch("/public/courses");
                if (res.ok) {
                    setCourses(await res.json());
                }
            } catch (error) {
                console.error("Failed to fetch courses/modules", error);
            }
        };
        fetchCourses();
    }, []);

    const filteredQuestions = useMemo(() => {
        if (!simulado?.questions) return [];

        const byModule = selectedModuleIds.length === 0
            ? simulado.questions
            : simulado.questions.filter((question) => question.module?.id && selectedModuleIds.includes(question.module.id));

        return byModule.slice(0, questionCount);
    }, [simulado, selectedModuleIds, questionCount]);

    useEffect(() => {
        setCurrentQuestionIdx(0);
    }, [selectedModuleIds, questionCount]);

    const handleApplyConfig = async () => {
        if (simuladoId) return;

        setIsApplyingConfig(true);
        // Agora o backend filtra corretamente, então buscamos exatamente a quantidade desejada
        await fetchSimulado(questionCount);
        setIsApplyingConfig(false);
    };

    const handleNext = () => {
        if (currentQuestionIdx < filteredQuestions.length - 1) {
            setCurrentQuestionIdx(currentQuestionIdx + 1);
        } else {
            alert("Quiz concluído!");
            router.push("/dashboard");
        }
    };

    const [showConfig, setShowConfig] = useState(false);

    if (isLoading) {
        return <div className="p-8 text-center text-muted-foreground uppercase tracking-widest animate-pulse">Carregando questões...</div>;
    }

    if (!simulado || !simulado.questions || simulado.questions.length === 0) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center bg-card p-12 rounded-3xl border border-muted shadow-sm">
                    <h2 className="text-xl font-bold mb-4">Nenhuma questão encontrada</h2>
                    <Link href="/dashboard">
                        <Button>Voltar para o Dashboard</Button>
                    </Link>
                </div>
            </div>
        );
    }

    if (filteredQuestions.length === 0) {
        return (
            <div className="w-full px-4 sm:px-6 py-6 sm:py-8">
                <div className="flex items-center justify-between mb-6">
                    <Link href="/dashboard">
                        <Button variant="ghost" className="rounded-xl flex items-center gap-2">
                            <ChevronLeft className="w-4 h-4" />
                            Voltar
                        </Button>
                    </Link>
                </div>
                <div className="bg-card border rounded-3xl p-8 text-center">
                    <h2 className="text-xl font-bold mb-2">Sem questões para este módulo</h2>
                    <p className="text-muted-foreground mb-6">Tente escolher outro módulo ou aplique uma nova configuração.</p>
                    {!isFree && (
                        <Button onClick={() => setShowConfig(true)} variant="outline" className="mb-4">
                            Abrir Configurações
                        </Button>
                    )}
                    <br />
                    <Button onClick={handleApplyConfig} disabled={isApplyingConfig || !!simuladoId}>
                        {isApplyingConfig ? "Atualizando..." : "Atualizar questões"}
                    </Button>
                </div>
            </div>
        );
    }

    const currentQuestion = filteredQuestions[currentQuestionIdx];

    const formattedOptions = currentQuestion.options ? Object.entries(currentQuestion.options).map(([key, value]) => ({
        id: key,
        text: value as string,
    })) : [];

    const mappedQuestion = {
        id: currentQuestion.id,
        statement: currentQuestion.statement,
        options: formattedOptions,
        correctOptionId: currentQuestion.correctOption,
        resolution: currentQuestion.resolution || "Resolução não disponível para esta questão.",
        banca: currentQuestion.banca,
        year: currentQuestion.year,
        subject: currentQuestion.module?.title || currentQuestion.subject,
    };

    return (
        <div ref={containerRef} className="min-h-screen bg-background relative overflow-hidden pb-12">
            {/* Design Background elements */}
            <div className={`pointer-events-none absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-primary/5 blur-[120px] ${isFocusMode ? "opacity-30" : ""}`} />
            <div className={`pointer-events-none absolute top-1/2 -left-40 h-[600px] w-[600px] rounded-full bg-primary/5 blur-[120px] ${isFocusMode ? "opacity-30" : ""}`} />

            {/* Floating Focus Controls */}
            <div className="fixed top-4 right-4 z-[100] flex items-center gap-2 p-1.5 rounded-2xl bg-white/60 backdrop-blur-xl border border-white/40 shadow-2xl">
                <Button
                    variant="ghost"
                    size="sm"
                    className={`rounded-xl px-4 py-6 flex flex-col items-center gap-1 transition-all ${isFocusMode ? "bg-primary text-primary-foreground shadow-lg h-auto" : "text-slate-600 hover:bg-white/80 h-auto"}`}
                    onClick={() => setIsFocusMode(!isFocusMode)}
                    title={isFocusMode ? "Sair do Modo Foco" : "Entrar no Modo Foco"}
                >
                    {isFocusMode ? <LayoutGrid size={18} /> : <Maximize size={18} />}
                    <span className="text-[9px] font-black uppercase tracking-widest">{isFocusMode ? "Normal" : "Foco"}</span>
                </Button>

                <Button
                    variant="ghost"
                    size="sm"
                    className={`rounded-xl px-4 py-6 flex flex-col items-center gap-1 transition-all ${isFullscreen ? "bg-slate-900 text-white shadow-lg h-auto" : "text-slate-600 hover:bg-white/80 h-auto"}`}
                    onClick={toggleFullscreen}
                    title={isFullscreen ? "Sair da Tela Cheia" : "Tela Cheia"}
                >
                    {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
                    <span className="text-[9px] font-black uppercase tracking-widest">{isFullscreen ? "Sair" : "Cheia"}</span>
                </Button>
            </div>

            <div className={`container mx-auto max-w-5xl px-4 sm:px-6 relative z-10 transition-all ${isFocusMode ? "py-4 md:py-12" : "py-4 sm:py-8"}`}>
                {/* Header Navigation */}
                {!isFocusMode && (
                    <div className="flex flex-wrap items-center justify-between mb-8 sm:mb-12 gap-3">
                        <Link href="/dashboard">
                            <Button variant="ghost" className="rounded-2xl flex items-center gap-2 px-4 hover:bg-primary/10 hover:text-primary group transition-all">
                                <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                                <span className="font-bold">Voltar ao Início</span>
                            </Button>
                        </Link>

                        <div className="flex items-center gap-2 sm:gap-4">
                            {!isFree ? (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowConfig(!showConfig)}
                                    className={`rounded-2xl h-10 sm:h-12 px-4 sm:px-5 flex items-center gap-2 font-black transition-all shadow-sm ${showConfig ? 'bg-primary text-primary-foreground border-primary shadow-primary/20' : 'bg-card/50 backdrop-blur-sm border-border/50 hover:bg-primary/5'}`}
                                >
                                    <Settings className="w-4 h-4" />
                                    <span className="hidden xs:inline">Configurações</span>
                                </Button>
                            ) : (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => alert("As configurações de treino são exclusivas para assinantes Premium.")}
                                    className="rounded-2xl h-10 sm:h-12 px-4 sm:px-5 flex items-center gap-2 font-black transition-all shadow-sm bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                                >
                                    <Lock className="w-4 h-4" />
                                    <span className="hidden xs:inline">Config Fechada</span>
                                </Button>
                            )}

                            <div className="flex items-center gap-2 text-xs font-black text-primary bg-primary/5 border border-primary/20 px-4 py-2 sm:py-3 rounded-2xl shadow-sm">
                                <LayoutGrid className="w-4 h-4" />
                                {currentQuestionIdx + 1}<span className="text-primary/40 font-bold mx-0.5">/</span>{filteredQuestions.length}
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Content Area */}
                <div className="max-w-4xl mx-auto space-y-8">
                    {!showConfig && !isFocusMode && (
                        <div className="mb-2">
                            <PageHeader
                                title={simulado.title}
                                description={simulado.description || "Foque na resolução e no aprendizado com gabaritos detalhados."}
                                badge="PRÁTICA ATIVA"
                            />
                        </div>
                    )}

                    <AnimatePresence>
                        {!simuladoId && showConfig && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -20, height: 0 }}
                                animate={{ opacity: 1, scale: 1, y: 0, height: "auto" }}
                                exit={{ opacity: 0, scale: 0.95, y: -20, height: 0 }}
                                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                                className="mb-12 overflow-hidden"
                            >
                                <div className="p-6 md:p-8 rounded-[2.5rem] border border-primary/20 bg-card/50 backdrop-blur-xl shadow-2xl shadow-primary/10">
                                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
                                        <div>
                                            <div className="flex items-center gap-2 text-sm font-black text-primary uppercase tracking-[0.2em] mb-2">
                                                <Sparkles className="w-4 h-4" />
                                                Personalize seu Treino
                                            </div>
                                            <p className="text-sm text-muted-foreground font-medium">Ajuste os filtros sem perder o seu progresso atual.</p>
                                        </div>

                                        <div className="hidden lg:flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 bg-muted/50 px-4 py-2 rounded-full border border-border/50">
                                            <SlidersHorizontal className="w-3.5 h-3.5" />
                                            Filtros Dinâmicos
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr_auto] gap-6 items-end">
                                        <div className="space-y-3">
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Módulos de Estudo</span>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        className="h-14 w-full rounded-[1.25rem] border-border/50 bg-background/50 px-5 text-sm font-bold justify-between hover:bg-background/80 transition-all"
                                                    >
                                                        <span className="truncate mr-2">{selectedModulesText}</span>
                                                        <ChevronDown className="w-5 h-5 shrink-0 text-primary opacity-50" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] max-h-[350px] overflow-y-auto rounded-3xl border-border/40 p-3 shadow-2xl backdrop-blur-2xl">
                                                    <DropdownMenuLabel className="flex items-center justify-between py-2 px-4 mb-2">
                                                        <span className="text-xs font-black uppercase tracking-widest">Selecionar Módulos</span>
                                                        {selectedModuleIds.length > 0 && (
                                                            <button
                                                                onClick={(e) => { e.preventDefault(); setSelectedModuleIds([]); }}
                                                                className="text-[10px] font-black text-primary hover:underline uppercase tracking-wide"
                                                            >
                                                                Limpar
                                                            </button>
                                                        )}
                                                    </DropdownMenuLabel>
                                                    <DropdownMenuSeparator className="mb-2 opacity-50" />
                                                    <DropdownMenuCheckboxItem
                                                        checked={selectedModuleIds.length === 0}
                                                        onCheckedChange={() => setSelectedModuleIds([])}
                                                        className="rounded-xl mb-1 py-3 px-4 font-bold focus:bg-primary/10 focus:text-primary transition-colors"
                                                    >
                                                        Todos os módulos
                                                    </DropdownMenuCheckboxItem>
                                                    {modules.map((module) => (
                                                        <DropdownMenuCheckboxItem
                                                            key={module.id}
                                                            className="rounded-xl mb-1 py-3 px-4 font-bold focus:bg-primary/10 focus:text-primary transition-colors"
                                                            checked={selectedModuleIds.includes(module.id)}
                                                            onCheckedChange={(checked) => {
                                                                if (checked) {
                                                                    setSelectedModuleIds(prev => [...prev, module.id]);
                                                                } else {
                                                                    setSelectedModuleIds(prev => prev.filter(id => id !== module.id));
                                                                }
                                                            }}
                                                        >
                                                            {module.title}
                                                        </DropdownMenuCheckboxItem>
                                                    ))}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>

                                        <div className="space-y-3">
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Questões</span>
                                            <div className="grid grid-cols-3 gap-2">
                                                {[10, 50, 100].map((value) => (
                                                    <button
                                                        type="button"
                                                        key={value}
                                                        onClick={() => setQuestionCount(value)}
                                                        className={`h-14 rounded-[1.25rem] border-2 text-sm font-black transition-all ${questionCount === value ? "border-primary bg-primary/10 text-primary shadow-lg shadow-primary/5" : "border-border/50 hover:border-primary/30 text-muted-foreground/70"}`}
                                                    >
                                                        {value}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <Button
                                            onClick={() => {
                                                handleApplyConfig();
                                                setShowConfig(false);
                                            }}
                                            disabled={isApplyingConfig}
                                            className="h-14 rounded-[1.25rem] font-black px-8 shadow-xl shadow-primary/25 hover:scale-105 active:scale-95 transition-all text-base"
                                        >
                                            {isApplyingConfig ? "Salvando..." : "Aplicar"}
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div key={mappedQuestion.id} className="pb-10">
                        <QuestionViewer
                            {...mappedQuestion}
                            onNext={handleNext}
                            hideTopBar={isFocusMode}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ModoTreinoPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Carregando modo treino...</div>}>
            <TreinoContent />
        </Suspense>
    );
}
