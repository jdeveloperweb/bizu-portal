import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Download, Share2, ZoomIn, ZoomOut, Maximize2, FileText, ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function MaterialViewerPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
                <Link href="/cursos">
                    <Button variant="ghost" className="rounded-xl flex items-center gap-2">
                        <ChevronLeft className="w-4 h-4" />
                        Voltar ao Curso
                    </Button>
                </Link>

                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" className="rounded-full">
                        <Share2 className="w-4 h-4" />
                    </Button>
                    <Button className="rounded-2xl px-6 flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Download PDF
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-3 space-y-6">
                    <div className="bg-card border rounded-[40px] overflow-hidden shadow-2xl relative">
                        {/* PDF Viewer Controls Overlay */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 px-6 py-3 bg-background/80 backdrop-blur-md rounded-2xl border shadow-xl z-10">
                            <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg"><ZoomOut className="w-4 h-4" /></Button>
                            <div className="text-sm font-bold px-4 border-x">1 / 45</div>
                            <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg"><ZoomIn className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg outline ml-2"><Maximize2 className="w-4 h-4" /></Button>
                        </div>

                        {/* Mock PDF Content */}
                        <div className="aspect-[1/1.4] bg-muted/30 p-12 md:p-20 flex flex-col items-center justify-start overflow-y-auto">
                            <div className="max-w-2xl w-full space-y-8 bg-white p-12 shadow-sm rounded-sm min-h-full">
                                <div className="h-4 w-1/4 bg-primary/20 rounded-full" />
                                <h1 className="text-4xl font-extrabold text-slate-800">Direito Administrativo - Atos e Poderes</h1>
                                <div className="space-y-4">
                                    <div className="h-3 w-full bg-slate-100 rounded-full" />
                                    <div className="h-3 w-full bg-slate-100 rounded-full" />
                                    <div className="h-3 w-5/6 bg-slate-100 rounded-full" />
                                </div>
                                <div className="p-8 bg-primary/5 rounded-2xl border-l-4 border-primary space-y-4">
                                    <h3 className="font-bold text-primary">Conceito de Ato Administrativo</h3>
                                    <div className="h-3 w-full bg-primary/10 rounded-full" />
                                    <div className="h-3 w-4/5 bg-primary/10 rounded-full" />
                                </div>
                                <div className="space-y-4">
                                    {[1, 2, 3, 4, 5, 6].map(i => (
                                        <div key={i} className="h-3 w-full bg-slate-50 rounded-full" />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="p-8 rounded-[40px] bg-card border">
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-primary" />
                            Conteúdo da Aula
                        </h3>
                        <div className="space-y-2">
                            {[
                                "1. Introdução aos Poderes",
                                "2. Poder Hierárquico",
                                "3. Poder Disciplinar",
                                "4. Poder de Polícia",
                                "5. Abuso de Poder",
                            ].map((item, idx) => (
                                <div key={idx} className={cn(
                                    "p-4 rounded-2xl text-sm font-medium transition-colors cursor-pointer",
                                    idx === 0 ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "hover:bg-muted"
                                )}>
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-8 rounded-[40px] bg-card border text-center">
                        <h4 className="font-bold mb-2">Dúvidas sobre o material?</h4>
                        <p className="text-xs text-muted-foreground mb-6">Nossos professores respondem em até 24h.</p>
                        <Button variant="outline" className="w-full rounded-2xl font-bold">Abrir Chamado</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(" ");
}
