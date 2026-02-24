"use client";

import QuestionViewer from "@/components/questions/QuestionViewer";
import PageHeader from "@/components/PageHeader";
import { Timer, LayoutGrid, ChevronLeft, Sparkles, SlidersHorizontal, ChevronDown } from "lucide-react";
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
import { useState, useEffect, Suspense, useMemo } from "react";
import { apiFetch } from "@/lib/api";
import { motion } from "framer-motion";
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
    const { selectedCourseId } = useAuth();

    const [simulado, setSimulado] = useState<SimuladoData | null>(null);
    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedModuleIds, setSelectedModuleIds] = useState<string[]>([]);
    const [questionCount, setQuestionCount] = useState(10);
    const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isApplyingConfig, setIsApplyingConfig] = useState(false);

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

    if (isLoading) {
        return <div className="p-8 text-center text-muted-foreground">Carregando questões...</div>;
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
            <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 w-full max-w-[1600px]">
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
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 w-full max-w-[1600px] relative overflow-hidden">
            <div className="pointer-events-none absolute -top-16 right-0 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
            <div className="pointer-events-none absolute top-48 -left-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />

            <div className="flex flex-wrap items-center justify-between mb-6 md:mb-8 gap-3 relative z-10">
                <Link href="/dashboard">
                    <Button variant="ghost" className="rounded-xl flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 -ml-2 sm:ml-0">
                        <ChevronLeft className="w-4 h-4" />
                        Voltar
                    </Button>
                </Link>

                <div className="flex items-center gap-2 sm:gap-6">
                    <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-bold text-muted-foreground bg-muted px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl">
                        <Timer className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        Treino Livre
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-bold text-primary bg-primary/10 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl">
                        <LayoutGrid className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        {currentQuestionIdx + 1}/{filteredQuestions.length}
                    </div>
                </div>
            </div>

            <PageHeader
                title={simulado.title}
                description={simulado.description || "Foque na resolução e no aprendizado com gabaritos detalhados."}
                badge="ESTUDO ATIVO"
            />

            {!simuladoId && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                    className="mt-6 mb-8 p-5 sm:p-6 rounded-3xl border bg-card/90 backdrop-blur-sm shadow-lg shadow-primary/5"
                >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 text-sm font-bold text-primary mb-1">
                                <Sparkles className="w-4 h-4" />
                                Configuração rápida do quiz
                            </div>
                            <p className="text-sm text-muted-foreground">Escolha o módulo e a quantidade sem sair desta tela.</p>
                        </div>

                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            <SlidersHorizontal className="w-4 h-4" />
                            Modo dinâmico
                        </div>
                    </div>

                    <div className="mt-5 grid grid-cols-1 lg:grid-cols-[1.4fr_1fr_auto] gap-3 items-end">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Assunto / módulo</span>
                                <span className="text-[10px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-full">
                                    {modules.length} MÓDULOS NO TOTAL
                                </span>
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="h-11 w-full rounded-2xl border bg-background px-4 text-sm font-medium justify-between hover:bg-background/80"
                                    >
                                        <span className="truncate mr-2">{selectedModulesText}</span>
                                        <ChevronDown className="w-4 h-4 shrink-0 opacity-50" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] max-h-[300px] overflow-y-auto rounded-xl border-muted/30 p-2 shadow-2xl">
                                    <DropdownMenuLabel className="flex items-center justify-between py-2 px-3">
                                        <span>Selecionar Módulos</span>
                                        {selectedModuleIds.length > 0 && (
                                            <button
                                                onClick={(e) => { e.preventDefault(); setSelectedModuleIds([]); }}
                                                className="text-[10px] font-bold text-primary hover:underline"
                                            >
                                                LIMPAR TODOS
                                            </button>
                                        )}
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuCheckboxItem
                                        checked={selectedModuleIds.length === 0}
                                        onCheckedChange={() => setSelectedModuleIds([])}
                                        className="rounded-lg mb-1"
                                    >
                                        Todos os módulos
                                    </DropdownMenuCheckboxItem>
                                    <DropdownMenuSeparator />
                                    {modules.map((module) => (
                                        <DropdownMenuCheckboxItem
                                            key={module.id}
                                            className="rounded-lg mb-1"
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

                        <label className="space-y-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Quantidade</span>
                            <div className="grid grid-cols-3 gap-2">
                                {[10, 50, 100].map((value) => (
                                    <button
                                        type="button"
                                        key={value}
                                        onClick={() => setQuestionCount(value)}
                                        className={`h-11 rounded-xl border text-sm font-extrabold transition ${questionCount === value ? "border-primary bg-primary/10 text-primary" : "hover:border-primary/40 text-muted-foreground"}`}
                                    >
                                        {value}
                                    </button>
                                ))}
                            </div>
                        </label>

                        <Button
                            onClick={handleApplyConfig}
                            disabled={isApplyingConfig}
                            className="h-11 rounded-2xl font-bold px-6 shadow-lg shadow-primary/20"
                        >
                            {isApplyingConfig ? "Aplicando..." : "Aplicar"}
                        </Button>
                    </div>

                    <p className="text-xs text-muted-foreground mt-3">
                        Filtro atual: <span className="font-bold text-foreground">{selectedModulesText}</span>
                    </p>
                </motion.div>
            )}

            <div key={mappedQuestion.id}>
                <QuestionViewer {...mappedQuestion} onNext={handleNext} />
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
