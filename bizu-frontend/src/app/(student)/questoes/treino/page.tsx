import QuestionViewer from "@/components/questions/QuestionViewer";
import PageHeader from "@/components/PageHeader";
import { Timer, LayoutGrid, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ModoTreinoPage() {
    const mockQuestion = {
        id: "1",
        statement: "Acerca da competência da Justiça Federal, assinale a opção correta considerando a jurisprudência dominante dos Tribunais Superiores e as disposições constitucionais.",
        options: [
            { id: "A", text: "Compete à Justiça Federal processar e julgar os crimes cometidos a bordo de navios ou aeronaves, independentemente da internacionalidade do trajeto." },
            { id: "B", text: "A Justiça Estadual é competente para julgar mandado de segurança contra ato de dirigente de instituição de ensino superior privada no exercício de função delegada." },
            { id: "C", text: "Aos juízes federais compete processar e julgar as causas em que a União, entidade autárquica ou empresa pública federal forem interessadas na condição de autoras, rés, assistentes ou oponentes." },
            { id: "D", text: "O foro de domicílio do autor é sempre o competente para as ações ajuizadas contra a União Federal." },
        ],
        correctOptionId: "C",
        resolution: "Conforme o Art. 109, I, da Constituição Federal, compete aos juízes federais processar e julgar as causas em que a União, entidade autárquica ou empresa pública federal forem interessadas na condição de autoras, rés, assistentes ou oponentes, exceto as de falência, as de acidentes de trabalho e as sujeitas à Justiça Eleitoral e à Justiça do Trabalho.",
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-5xl">
            <div className="flex flex-wrap items-center justify-between mb-6 md:mb-8 gap-3">
                <Link href="/questoes">
                    <Button variant="ghost" className="rounded-xl flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 -ml-2 sm:ml-0">
                        <ChevronLeft className="w-4 h-4" />
                        <span className="hidden sm:inline">Voltar ao Banco</span>
                        <span className="sm:hidden text-sm">Voltar</span>
                    </Button>
                </Link>

                <div className="flex items-center gap-2 sm:gap-6">
                    <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-bold text-muted-foreground bg-muted px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl">
                        <Timer className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        00:12:45
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-bold text-primary bg-primary/10 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl">
                        <LayoutGrid className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        1/50
                    </div>
                </div>
            </div>

            <PageHeader
                title="Modo Treino"
                description="Foque na resolução e no aprendizado com gabaritos detalhados."
                badge="ESTUDO ATIVO"
            />

            <QuestionViewer {...mockQuestion} />
        </div>
    );
}
