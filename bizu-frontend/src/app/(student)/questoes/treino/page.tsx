"use client";

import QuestionViewer from "@/components/questions/QuestionViewer";
import PageHeader from "@/components/PageHeader";
import { Timer, LayoutGrid, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { apiFetch } from "@/lib/api";

function TreinoContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const simuladoId = searchParams.get("simulado");

    const [simulado, setSimulado] = useState<any>(null);
    const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSimulado = async () => {
            setIsLoading(true);
            try {
                let url = "/simulados/quiz/rapido"; // Default to quick quiz
                if (simuladoId) {
                    url = `/simulados/${simuladoId}`;
                }
                const res = await apiFetch(url);
                if (res.ok) {
                    const data = await res.json();
                    setSimulado(data);
                }
            } catch (error) {
                console.error("Failed to fetch practice exam", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchSimulado();
    }, [simuladoId]);

    const handleNext = () => {
        if (simulado && currentQuestionIdx < simulado.questions.length - 1) {
            setCurrentQuestionIdx(currentQuestionIdx + 1);
        } else {
            // End of exam
            alert("Simulado concluído!");
            router.push("/simulados");
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
                    <Link href="/simulados">
                        <Button>Voltar para Simulados</Button>
                    </Link>
                </div>
            </div>
        );
    }

    const currentQuestion = simulado.questions[currentQuestionIdx];

    // Convert backend options format (Map) to frontend format
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
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 w-full max-w-[1600px]">
            <div className="flex flex-wrap items-center justify-between mb-6 md:mb-8 gap-3">
                <Link href="/simulados">
                    <Button variant="ghost" className="rounded-xl flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 -ml-2 sm:ml-0">
                        <ChevronLeft className="w-4 h-4" />
                        <span className="hidden sm:inline">Voltar</span>
                        <span className="sm:hidden text-sm">Voltar</span>
                    </Button>
                </Link>

                <div className="flex items-center gap-2 sm:gap-6">
                    <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-bold text-muted-foreground bg-muted px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl">
                        <Timer className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        Треino Livre
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-bold text-primary bg-primary/10 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl">
                        <LayoutGrid className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        {currentQuestionIdx + 1}/{simulado.questions.length}
                    </div>
                </div>
            </div>

            <PageHeader
                title={simulado.title}
                description={simulado.description || "Foque na resolução e no aprendizado com gabaritos detalhados."}
                badge="ESTUDO ATIVO"
            />

            <div key={mappedQuestion.id}>
                {/* O component QuestionViewer mantém o estado isSubmitted internamente, então precisamos forçar recriação com `key` onChange da questão */}
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
