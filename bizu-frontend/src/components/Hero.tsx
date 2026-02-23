import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Target, Award } from "lucide-react";

export default function Hero() {
    return (
        <div className="relative overflow-hidden bg-background pt-16 pb-32">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/20 blur-[120px] rounded-full" />
            </div>

            <div className="container mx-auto px-4 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                    </span>
                    Nova versão 2.0 disponível
                </div>

                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                    Sua Aprovação Começa <br />
                    <span className="text-primary italic">Aqui no Bizu!</span>
                </h1>

                <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground mb-10">
                    A plataforma definitiva para concursos e exames. Simulados inteligentes,
                    banco de questões atualizado e trilhas de estudo personalizadas.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
                    <Button size="lg" className="rounded-full px-8 h-14 text-lg">
                        Começar Agora Grátis
                        <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                    <Button size="lg" variant="outline" className="rounded-full px-8 h-14 text-lg">
                        Ver Planos
                    </Button>
                </div>

                {/* Stats Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                    <div className="p-6 rounded-2xl bg-surface/50 border border-border/50 backdrop-blur-sm">
                        <BookOpen className="w-10 h-10 text-primary mb-4 mx-auto" />
                        <div className="text-3xl font-bold mb-1">50k+</div>
                        <div className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Questões</div>
                    </div>
                    <div className="p-6 rounded-2xl bg-surface/50 border border-border/50 backdrop-blur-sm">
                        <Target className="w-10 h-10 text-accent mb-4 mx-auto" />
                        <div className="text-3xl font-bold mb-1">98%</div>
                        <div className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Taxa de Satisfação</div>
                    </div>
                    <div className="p-6 rounded-2xl bg-surface/50 border border-border/50 backdrop-blur-sm">
                        <Award className="w-10 h-10 text-success mb-4 mx-auto" />
                        <div className="text-3xl font-bold mb-1">10k+</div>
                        <div className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Alunos Aprovados</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
