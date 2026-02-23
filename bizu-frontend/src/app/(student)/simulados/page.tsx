import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Timer, FileText, CheckCircle2, PlayCircle } from "lucide-react";
import Link from "next/link";

export default function SimuladosPage() {
    const simulados = [
        {
            id: "1",
            title: "Simulado Geral TRF - Semanal #12",
            questions: 50,
            time: 120,
            status: "DISPONÍVEL",
            difficulty: "Médio",
        },
        {
            id: "2",
            title: "Legislação Especial - Delegado PC",
            questions: 30,
            time: 60,
            status: "CONCLUÍDO",
            score: 85,
        },
        {
            id: "3",
            title: "Estatuto da Magistratura (LOMAN)",
            questions: 20,
            time: 45,
            status: "DISPONÍVEL",
            difficulty: "Difícil",
        },
    ];

    return (
        <div className="container mx-auto px-4 py-12">
            <PageHeader
                title="Simulados"
                description="Treine com tempo real e questões selecionadas para o seu concurso."
                badge="TREINAMENTO"
            />

            <div className="grid grid-cols-1 gap-6">
                {simulados.map((s) => (
                    <div key={s.id} className="bg-card border rounded-3xl p-6 md:p-8 hover:border-primary transition-all group">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${s.status === "CONCLUÍDO" ? "bg-success/10 text-success" : "bg-primary/10 text-primary"
                                        }`}>
                                        {s.status}
                                    </span>
                                    {s.difficulty && (
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase">
                                            • {s.difficulty}
                                        </span>
                                    )}
                                </div>
                                <h3 className="text-xl font-black mb-4 group-hover:text-primary transition-colors">{s.title}</h3>

                                <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground font-medium">
                                    <div className="flex items-center gap-2">
                                        <FileText className="w-4 h-4" />
                                        {s.questions} Questões
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Timer className="w-4 h-4" />
                                        {s.time} Minutos
                                    </div>
                                    {s.status === "CONCLUÍDO" && (
                                        <div className="flex items-center gap-2 text-success">
                                            <CheckCircle2 className="w-4 h-4" />
                                            Nota: {s.score}%
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                {s.status === "CONCLUÍDO" ? (
                                    <Link href="/treino">
                                        <Button variant="outline" className="h-14 rounded-2xl font-black text-lg gap-2 border-primary/20 hover:bg-primary/5">
                                            Treino Rápido
                                        </Button>
                                    </Link>
                                ) : (
                                    <Link href={`/questoes/treino?simulado=${s.id}`}>
                                        <Button className="rounded-2xl px-12 h-12 font-bold flex items-center gap-2 shadow-lg shadow-primary/20">
                                            <PlayCircle className="w-5 h-5" />
                                            Iniciar Agora
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
