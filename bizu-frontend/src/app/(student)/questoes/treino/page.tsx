"use client";

import QuestionViewer from "@/components/questions/QuestionViewer";
import {
    LayoutGrid, ChevronLeft, Sparkles, SlidersHorizontal,
    ChevronDown, Settings, Maximize, Minimize, Lock,
} from "lucide-react";
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
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/components/AuthProvider";
import { useCustomDialog } from "@/components/CustomDialogProvider";

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
    const { alert } = useCustomDialog();

    const [simulado, setSimulado] = useState<SimuladoData | null>(null);
    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedModuleIds, setSelectedModuleIds] = useState<string[]>([]);
    const [questionCount, setQuestionCount] = useState(10);
    const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isApplyingConfig, setIsApplyingConfig] = useState(false);
    const [isFocusMode, setIsFocusMode] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showConfig, setShowConfig] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener("fullscreenchange", handleFullscreenChange);
        return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
    }, []);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen().catch(console.error);
        } else {
            document.exitFullscreen();
        }
    };

    const modules = useMemo(() => {
        if (!selectedCourseId) return [];
        return courses.find((c) => c.id === selectedCourseId)?.modules || [];
    }, [courses, selectedCourseId]);

    const selectedModulesText = useMemo(() => {
        if (selectedModuleIds.length === 0) return "Todos os módulos";
        if (selectedModuleIds.length === 1)
            return modules.find(m => m.id === selectedModuleIds[0])?.title || "1 módulo";
        return `${selectedModuleIds.length} módulos`;
    }, [selectedModuleIds, modules]);

    const fetchSimulado = async (count = questionCount) => {
        setIsLoading(true);
        try {
            let url = `/simulados/quiz/rapido?count=${count}`;
            if (selectedModuleIds.length > 0) url += `&moduleIds=${selectedModuleIds.join(",")}`;
            if (simuladoId) url = `/simulados/${simuladoId}`;
            const res = await apiFetch(url);
            if (res.ok) {
                setSimulado(await res.json());
                setCurrentQuestionIdx(0);
            }
        } catch (error) {
            console.error("Failed to fetch practice exam", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchSimulado(questionCount); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [simuladoId]);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await apiFetch("/student/courses/me");
                if (res.ok) setCourses(await res.json());
            } catch (error) {
                console.error("Failed to fetch courses", error);
            }
        };
        fetchCourses();
    }, []);

    const filteredQuestions = useMemo(() => {
        if (!simulado?.questions) return [];
        const byModule = selectedModuleIds.length === 0
            ? simulado.questions
            : simulado.questions.filter(q => q.module?.id && selectedModuleIds.includes(q.module.id));
        return byModule.slice(0, questionCount);
    }, [simulado, selectedModuleIds, questionCount]);

    useEffect(() => { setCurrentQuestionIdx(0); }, [selectedModuleIds, questionCount]);

    const handleApplyConfig = async () => {
        if (simuladoId) return;
        setIsApplyingConfig(true);
        await fetchSimulado(questionCount);
        setIsApplyingConfig(false);
    };

    const handleNext = () => {
        if (currentQuestionIdx < filteredQuestions.length - 1) {
            setCurrentQuestionIdx(currentQuestionIdx + 1);
        } else {
            alert("Quiz concluído!", { type: "success" }).then(() => router.push("/dashboard"));
        }
    };

    // ── Loading ──
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                    <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/50">Carregando</span>
                </div>
            </div>
        );
    }

    if (!simulado?.questions?.length) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6">
                <div className="text-center bg-card p-12 rounded-3xl border border-border max-w-sm w-full">
                    <h2 className="text-xl font-bold mb-4">Nenhuma questão encontrada</h2>
                    <Link href="/dashboard"><Button>Voltar ao Dashboard</Button></Link>
                </div>
            </div>
        );
    }

    if (filteredQuestions.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6">
                <div className="text-center bg-card border rounded-3xl p-8 max-w-sm w-full">
                    <h2 className="text-lg font-bold mb-2">Sem questões para este módulo</h2>
                    <p className="text-sm text-muted-foreground mb-6">Tente outro módulo ou ajuste as configurações.</p>
                    <Button onClick={handleApplyConfig} disabled={isApplyingConfig || !!simuladoId}>
                        {isApplyingConfig ? "Atualizando..." : "Atualizar"}
                    </Button>
                </div>
            </div>
        );
    }

    const currentQuestion = filteredQuestions[currentQuestionIdx];
    const formattedOptions = Object.entries(currentQuestion.options).map(([key, value]) => ({
        id: key, text: value as string,
    }));
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

    // Progress
    const progressPct = Math.round((currentQuestionIdx / filteredQuestions.length) * 100);

    return (
        <div ref={containerRef} className="min-h-screen bg-background flex flex-col">

            {/* ── Top progress bar (full-width, fixed) ── */}
            <div className="fixed top-0 left-0 right-0 z-[200] h-[3px] bg-muted/50">
                <motion.div
                    className="h-full bg-primary shadow-[0_0_6px_hsl(var(--primary)/0.5)]"
                    initial={false}
                    animate={{ width: `${progressPct}%` }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                />
            </div>

            {/* ── Sticky header ── */}
            <AnimatePresence>
                {!isFocusMode && (
                    <motion.header
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.3 }}
                        className="sticky top-0 z-[100] bg-background/95 backdrop-blur-md border-b border-border/20"
                    >
                        <div className="max-w-2xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
                            {/* Back */}
                            <Link href="/dashboard" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors group shrink-0">
                                <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                                <span className="text-xs font-bold hidden sm:inline">Voltar</span>
                            </Link>

                            {/* Title + counter */}
                            <div className="flex items-center gap-2 flex-1 justify-center min-w-0">
                                <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/50 hidden sm:inline truncate">
                                    {simulado.title}
                                </span>
                                <span className="text-[10px] font-black text-muted-foreground/30 hidden sm:inline">·</span>
                                <div className="flex items-center gap-1 text-xs font-black">
                                    <span className="text-primary">{currentQuestionIdx + 1}</span>
                                    <span className="text-muted-foreground/30">/</span>
                                    <span className="text-muted-foreground/60">{filteredQuestions.length}</span>
                                </div>
                            </div>

                            {/* Right controls */}
                            <div className="flex items-center gap-1.5 shrink-0">
                                {/* Config */}
                                {!simuladoId && (
                                    !isFree ? (
                                        <button
                                            onClick={() => setShowConfig(!showConfig)}
                                            className={cn(
                                                "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border",
                                                showConfig
                                                    ? "bg-primary text-primary-foreground border-primary"
                                                    : "text-muted-foreground border-border/50 hover:border-border hover:text-foreground"
                                            )}
                                        >
                                            <Settings className="w-3 h-3" />
                                            <span className="hidden sm:inline">Config</span>
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => alert("Configurações exclusivas para Premium.", { type: "info", title: "Premium" })}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border border-border/30 text-muted-foreground/40 cursor-not-allowed"
                                        >
                                            <Lock className="w-3 h-3" />
                                        </button>
                                    )
                                )}

                                {/* Focus mode */}
                                <button
                                    onClick={() => setIsFocusMode(true)}
                                    title="Modo Foco"
                                    className="flex items-center justify-center w-8 h-8 rounded-xl text-muted-foreground border border-border/40 hover:border-border hover:text-foreground transition-all"
                                >
                                    <Maximize className="w-3.5 h-3.5" />
                                </button>

                                {/* Fullscreen (desktop only) */}
                                <button
                                    onClick={toggleFullscreen}
                                    title={isFullscreen ? "Sair da tela cheia" : "Tela cheia"}
                                    className="hidden sm:flex items-center justify-center w-8 h-8 rounded-xl text-muted-foreground border border-border/40 hover:border-border hover:text-foreground transition-all"
                                >
                                    {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
                                </button>
                            </div>
                        </div>
                    </motion.header>
                )}
            </AnimatePresence>

            {/* ── Focus mode exit ── */}
            <AnimatePresence>
                {isFocusMode && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed top-4 right-4 z-[100]"
                    >
                        <button
                            onClick={() => setIsFocusMode(false)}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-background/80 backdrop-blur-md border border-border/40 shadow-lg text-[10px] font-black uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <LayoutGrid className="w-3 h-3" />
                            <span>Normal</span>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Main content ── */}
            <main className={cn("flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 pb-16", isFocusMode ? "pt-12 md:pt-16" : "pt-8 md:pt-10")}>

                {/* Config panel */}
                <AnimatePresence>
                    {!simuladoId && showConfig && (
                        <motion.div
                            initial={{ opacity: 0, y: -8, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: "auto" }}
                            exit={{ opacity: 0, y: -8, height: 0 }}
                            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                            className="mb-8 overflow-hidden"
                        >
                            <div className="p-5 md:p-6 rounded-2xl border border-border/50 bg-muted/20">
                                <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest mb-5">
                                    <SlidersHorizontal className="w-3.5 h-3.5" />
                                    Personalizar treino
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-4 items-end">
                                    {/* Modules */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Módulos</label>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="outline" className="h-11 w-full rounded-xl border-border/50 text-sm font-medium justify-between px-4">
                                                    <span className="truncate mr-2">{selectedModulesText}</span>
                                                    <ChevronDown className="w-4 h-4 shrink-0 text-muted-foreground/50" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] max-h-[320px] overflow-y-auto rounded-2xl border-border/40 p-2 shadow-xl">
                                                <DropdownMenuLabel className="flex items-center justify-between py-1.5 px-3 mb-1">
                                                    <span className="text-[10px] font-black uppercase tracking-widest">Módulos</span>
                                                    {selectedModuleIds.length > 0 && (
                                                        <button onClick={(e) => { e.preventDefault(); setSelectedModuleIds([]); }} className="text-[10px] font-black text-primary hover:underline">
                                                            Limpar
                                                        </button>
                                                    )}
                                                </DropdownMenuLabel>
                                                <DropdownMenuSeparator className="mb-1 opacity-30" />
                                                <DropdownMenuCheckboxItem checked={selectedModuleIds.length === 0} onCheckedChange={() => setSelectedModuleIds([])} className="rounded-lg py-2.5 px-3 font-medium text-sm">
                                                    Todos os módulos
                                                </DropdownMenuCheckboxItem>
                                                {modules.map((module) => (
                                                    <DropdownMenuCheckboxItem
                                                        key={module.id}
                                                        className="rounded-lg py-2.5 px-3 font-medium text-sm"
                                                        checked={selectedModuleIds.includes(module.id)}
                                                        onCheckedChange={(checked) => {
                                                            setSelectedModuleIds(prev =>
                                                                checked ? [...prev, module.id] : prev.filter(id => id !== module.id)
                                                            );
                                                        }}
                                                    >
                                                        {module.title}
                                                    </DropdownMenuCheckboxItem>
                                                ))}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>

                                    {/* Question count */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Questões</label>
                                        <div className="flex gap-1.5">
                                            {[10, 50, 100].map((value) => (
                                                <button
                                                    key={value}
                                                    onClick={() => setQuestionCount(value)}
                                                    className={cn(
                                                        "h-11 w-14 rounded-xl border text-sm font-black transition-all",
                                                        questionCount === value
                                                            ? "border-primary bg-primary/10 text-primary"
                                                            : "border-border/50 text-muted-foreground/60 hover:border-border"
                                                    )}
                                                >
                                                    {value}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Apply */}
                                    <Button
                                        onClick={() => { handleApplyConfig(); setShowConfig(false); }}
                                        disabled={isApplyingConfig}
                                        className="h-11 rounded-xl font-black px-6"
                                    >
                                        {isApplyingConfig ? "…" : "Aplicar"}
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Question area with watermark number */}
                <div className="relative">
                    {/* Background watermark */}
                    <div
                        aria-hidden
                        className="absolute -top-6 -left-3 text-[120px] md:text-[160px] font-black text-primary/[0.04] leading-none select-none pointer-events-none tabular-nums"
                    >
                        {currentQuestionIdx + 1}
                    </div>

                    {/* Dot progress strip */}
                    {!isFocusMode && filteredQuestions.length <= 20 && (
                        <div className="flex items-center gap-1 mb-6 flex-wrap">
                            {filteredQuestions.map((_, i) => (
                                <div
                                    key={i}
                                    className={cn(
                                        "h-1 rounded-full transition-all duration-300",
                                        i < currentQuestionIdx
                                            ? "bg-primary/40 w-4"
                                            : i === currentQuestionIdx
                                                ? "bg-primary w-6"
                                                : "bg-border/40 w-4"
                                    )}
                                />
                            ))}
                        </div>
                    )}

                    {/* Question */}
                    <AnimatePresence mode="wait">
                        <div key={mappedQuestion.id} className="relative z-10">
                            <QuestionViewer
                                {...mappedQuestion}
                                onNext={handleNext}
                                hideTopBar={isFocusMode}
                            />
                        </div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}

export default function ModoTreinoPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
            </div>
        }>
            <TreinoContent />
        </Suspense>
    );
}
