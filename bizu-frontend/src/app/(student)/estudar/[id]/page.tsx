"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
    ChevronLeft,
    ChevronRight,
    Flag,
    HelpCircle,
    Timer,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Award,
    ArrowRight,
    RotateCcw
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { cn } from "@/lib/utils";

export default function StudySessionPage() {
    const params = useParams<{ id: string | string[] }>();
    const moduleId = Array.isArray(params.id) ? params.id[0] : params.id;
    const [module, setModule] = useState<any>(null);
    const [questions, setQuestions] = useState<any[]>([]);
    const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [timer, setTimer] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [score, setScore] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!moduleId) {
            setIsLoading(false);
            return;
        }

        const fetchModule = async () => {
            setIsLoading(true);
            try {
                const res = await apiFetch(`/public/modules/${moduleId}`);
                if (res.ok) {
                    const data = await res.json();
                    setModule(data);
                    // Ensure questions match expects format or adapt below
                    setQuestions(data.questions || []);
                }
            } catch (error) {
                console.error("Failed to fetch module questions", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchModule();
    }, [moduleId]);

    useEffect(() => {
        if (showResult) return;
        const interval = setInterval(() => {
            setTimer((prev) => prev + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [showResult]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const handleAnswer = () => {
        if (!selectedOption || !questions[currentQuestionIdx]) return;

        setIsAnswered(true);
        const currentQ = questions[currentQuestionIdx];
        if (selectedOption === currentQ.correctOption) {
            setScore(prev => prev + 1);
        }
    };

    const handleNext = () => {
        if (currentQuestionIdx < questions.length - 1) {
            setCurrentQuestionIdx(prev => prev + 1);
            setSelectedOption(null);
            setIsAnswered(false);
        } else {
            setShowResult(true);
        }
    };

    if (isLoading) return <div className="p-20 text-center">Carregando questões...</div>;
    if (questions.length === 0) return (
        <div className="p-20 text-center space-y-4">
            <h2 className="text-xl font-bold">Nenhuma questão encontrada para este módulo.</h2>
            <Link href={`/cursos/${module?.courseId || ""}`}>
                <Button variant="outline">Voltar ao Curso</Button>
            </Link>
        </div>
    );

    const q = questions[currentQuestionIdx];
    // Adapt possible formats: if options is a map or separate fields
    const options = q.options || {
        A: q.optionA,
        B: q.optionB,
        C: q.optionC,
        D: q.optionD,
        E: q.optionE
    };

    if (showResult) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center p-4">
                <div className="max-w-xl w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
                    <div className="relative inline-block">
                        <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full animate-pulse" />
                        <Award className="w-24 h-24 text-primary relative z-10 mx-auto transform hover:scale-110 transition-transform duration-500" />
                    </div>

                    <div className="space-y-4">
                        <h1 className="text-5xl font-black tracking-tight mb-2 bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">Sessão Concluída!</h1>
                        <p className="text-muted-foreground text-xl font-medium max-w-md mx-auto">Você completou esta etapa com excelência. Sua aprovação está cada vez mais próxima.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-8 rounded-[40px] bg-card border shadow-lg hover:shadow-success/5 transition-all">
                            <div className="text-4xl font-black text-success mb-1">{score}</div>
                            <div className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Acertos</div>
                        </div>
                        <div className="p-8 rounded-[40px] bg-card border shadow-lg">
                            <div className="text-4xl font-black text-danger mb-1">{questions.length - score}</div>
                            <div className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Erros</div>
                        </div>
                        <div className="p-8 rounded-[40px] bg-primary text-primary-foreground shadow-2xl shadow-primary/30">
                            <div className="text-4xl font-black mb-1">+{score * 10}</div>
                            <div className="text-[10px] uppercase font-black tracking-widest opacity-80">XP Ganhos</div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 pt-6">
                        <Link href={`/cursos/${module?.courseId || ""}`} className="w-full">
                            <Button className="w-full h-14 rounded-2xl font-black text-lg gap-2">
                                Voltar ao Curso
                                <ArrowRight className="w-5 h-5" />
                            </Button>
                        </Link>
                        <Button variant="ghost" className="h-14 rounded-2xl font-bold gap-2" onClick={() => window.location.reload()}>
                            <RotateCcw className="w-4 h-4" />
                            Refazer Questões
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-muted/30">
            {/* Session Header */}
            <header className="h-20 bg-background border-b flex items-center px-4 md:px-8 justify-between sticky top-0 z-50">
                <div className="flex items-center gap-6">
                    <Link href={`/materiais/${moduleId}`}>
                        <Button variant="ghost" size="icon" className="rounded-xl">
                            <ChevronLeft className="w-6 h-6" />
                        </Button>
                    </Link>
                    <div className="h-8 w-[2px] bg-muted hidden md:block" />
                    <div className="hidden md:block">
                        <div className="text-xs font-black text-muted-foreground uppercase tracking-widest">Treinando</div>
                        <div className="font-bold">{module?.title}</div>
                    </div>
                </div>

                <div className="flex items-center gap-4 md:gap-12">
                    <div className="flex items-center gap-2 font-mono font-black text-xl text-primary bg-primary/5 px-4 py-2 rounded-2xl border border-primary/10">
                        <Timer className="w-5 h-5" />
                        {formatTime(timer)}
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
                {/* Progress Dots */}
                <div className="flex justify-center gap-2 mb-12">
                    {questions.map((_, i) => (
                        <div key={i} className={cn(
                            "h-2 rounded-full transition-all duration-300",
                            i === currentQuestionIdx ? "w-12 bg-primary" :
                                i < currentQuestionIdx ? "w-2 bg-success" : "w-2 bg-muted-foreground/30"
                        )} />
                    ))}
                </div>

                {/* Question Card */}
                <div className="space-y-8">
                    <div className="p-8 md:p-12 rounded-[40px] bg-card border shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-2 h-full bg-primary" />
                        <h2 className="text-xl md:text-2xl font-bold leading-relaxed">
                            {q.statement}
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {Object.entries(options).filter(([_, val]) => !!val).map(([key, value]) => (
                            <button
                                key={key}
                                disabled={isAnswered}
                                onClick={() => setSelectedOption(key)}
                                className={cn(
                                    "group flex items-center gap-6 p-6 rounded-[28px] border-2 transition-all text-left relative",
                                    selectedOption === key && !isAnswered && "border-primary bg-primary/5 shadow-lg",
                                    isAnswered && key === q.correctOption && "border-success bg-success/5 text-success shadow-[0_0_20px_rgba(34,197,94,0.15)]",
                                    isAnswered && selectedOption === key && key !== q.correctOption && "border-danger bg-danger/5 text-danger opacity-80",
                                    !selectedOption && "hover:border-primary/50 hover:bg-muted/50",
                                    isAnswered && key !== q.correctOption && selectedOption !== key && "opacity-50"
                                )}
                            >
                                <div className={cn(
                                    "w-12 h-12 rounded-2xl flex items-center justify-center font-black transition-all shrink-0",
                                    selectedOption === key && !isAnswered ? "bg-primary text-primary-foreground shadow-lg" : "bg-muted text-muted-foreground",
                                    isAnswered && key === q.correctOption && "bg-success text-success-foreground",
                                    isAnswered && selectedOption === key && key !== q.correctOption && "bg-danger text-danger-foreground"
                                )}>
                                    {isAnswered && key === q.correctOption ? <CheckCircle2 className="w-6 h-6" /> :
                                        isAnswered && selectedOption === key && key !== q.correctOption ? <XCircle className="w-6 h-6" /> : key}
                                </div>
                                <span className="flex-1 font-bold text-lg">{value as string}</span>
                            </button>
                        ))}
                    </div>

                    {/* Resolution/Feedback */}
                    {isAnswered && (
                        <div className="animate-in slide-in-from-top-4 duration-500">
                            <div className={cn(
                                "p-8 rounded-[32px] border-2 space-y-4",
                                selectedOption === q.correctOption ? "bg-success/5 border-success/20" : "bg-danger/5 border-danger/20"
                            )}>
                                <div className="flex items-center gap-3">
                                    {selectedOption === q.correctOption ?
                                        <span className="flex items-center gap-2 text-success font-black uppercase tracking-widest text-sm">
                                            <CheckCircle2 className="w-5 h-5" /> Você acertou!
                                        </span> :
                                        <span className="flex items-center gap-2 text-danger font-black uppercase tracking-widest text-sm">
                                            <AlertTriangle className="w-5 h-5" /> Resposta Incorreta
                                        </span>
                                    }
                                </div>
                                {q.resolution && (
                                    <p className="text-muted-foreground leading-relaxed font-medium">
                                        <span className="font-bold text-foreground">Resolução:</span> {q.resolution}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Footer Controls */}
            <footer className="fixed bottom-0 left-0 w-full h-24 bg-background/80 backdrop-blur-xl border-t flex items-center px-4 md:px-8 z-50">
                <div className="container mx-auto max-w-4xl flex justify-between items-center">
                    <div className="text-sm font-bold text-muted-foreground hidden sm:block">
                        Questão {currentQuestionIdx + 1} de {questions.length}
                    </div>

                    <div className="flex gap-4 w-full sm:w-auto">
                        {!isAnswered ? (
                            <Button
                                disabled={!selectedOption}
                                onClick={handleAnswer}
                                className="w-full sm:w-48 h-14 rounded-2xl font-black text-lg shadow-xl shadow-primary/20"
                            >
                                Responder
                            </Button>
                        ) : (
                            <Button
                                onClick={handleNext}
                                className="w-full sm:w-48 h-14 rounded-2xl font-black text-lg gap-2"
                            >
                                {currentQuestionIdx < questions.length - 1 ? "Próxima Questão" : "Ver Resultado"}
                                <ChevronRight className="w-5 h-5" />
                            </Button>
                        )}
                    </div>
                </div>
            </footer>
        </div>
    );
}
