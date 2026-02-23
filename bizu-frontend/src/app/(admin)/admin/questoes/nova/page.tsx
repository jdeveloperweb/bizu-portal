"use client";

import PageHeader from "../../../../../components/PageHeader";
import RichTextEditor from "../../../../../components/admin/RichTextEditor";
import {
    Save,
    ArrowLeft,
    HelpCircle,
    Settings2,
    CheckCircle2,
    Layout,
    FileText,
    Dumbbell,
    PlusCircle
} from "lucide-react";
import { Button } from "../../../../../components/ui/button";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NovaQuestaoPage() {
    const router = useRouter();
    const [content, setContent] = useState("");
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState<"SIMULADO" | "QUIZ">("SIMULADO");
    const [difficulty, setDifficulty] = useState<"EASY" | "MEDIUM" | "HARD">("EASY");
    const [subject, setSubject] = useState("Direito Administrativo");
    const [banca, setBanca] = useState("");
    const [year, setYear] = useState(new Date().getFullYear());
    const [options, setOptions] = useState({
        A: "",
        B: "",
        C: "",
        D: ""
    });
    const [correctOption, setCorrectOption] = useState("A");

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

    const handleSave = async () => {
        try {
            const res = await fetch(`${apiUrl}/admin/questions`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    statement: content,
                    category,
                    difficulty,
                    subject,
                    banca,
                    year,
                    options,
                    correctOption,
                    questionType: "MULTIPLE_CHOICE"
                })
            });

            if (res.ok) {
                router.push("/admin/questoes");
            }
        } catch (error) {
            console.error("Failed to save question", error);
        }
    };

    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div className="space-y-4">
                    <Link href="/admin/questoes" className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 hover:text-primary transition-colors">
                        <ArrowLeft className="w-3 h-3" />
                        Voltar para Banco
                    </Link>
                    <PageHeader
                        title="Cadastrar Questão"
                        description="Configure o enunciado, alternativas e propriedades da questão."
                        badge="CMS"
                    />
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="h-14 rounded-2xl font-black px-8">Salvar Rascunho</Button>
                    <Button
                        onClick={handleSave}
                        className="h-14 rounded-2xl font-black px-12 gap-2 shadow-xl shadow-primary/20"
                    >
                        <Save className="w-5 h-5" />
                        Publicar Questão
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-8">
                    {/* Category Selector */}
                    <div className="bg-muted/30 p-2 rounded-[32px] inline-flex gap-2 mb-4 border border-muted/50">
                        <button
                            onClick={() => setCategory("SIMULADO")}
                            className={`flex items-center gap-2 px-6 py-3 rounded-[24px] font-black transition-all ${category === "SIMULADO" ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                        >
                            <FileText className="w-4 h-4" />
                            Simulado
                        </button>
                        <button
                            onClick={() => setCategory("QUIZ")}
                            className={`flex items-center gap-2 px-6 py-3 rounded-[24px] font-black transition-all ${category === "QUIZ" ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                        >
                            <Dumbbell className="w-4 h-4" />
                            Quick Quiz
                        </button>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Enunciado Principal</label>
                        <RichTextEditor
                            content={content}
                            onChange={setContent}
                            placeholder="Escreva o enunciado completo aqui. Use o editor para formatar o texto."
                        />
                    </div>

                    <div className="space-y-6">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 text-primary flex items-center gap-2 border-b border-primary/10 pb-2">
                            <PlusCircle className="w-4 h-4" />
                            Alternativas de Resposta
                        </label>
                        <div className="grid grid-cols-1 gap-4">
                            {Object.entries(options).map(([key, value]) => (
                                <div key={key} className={`flex items-center gap-4 p-4 rounded-3xl border-2 transition-all ${correctOption === key ? 'border-success bg-success/5 shadow-md shadow-success/10' : 'bg-card'}`}>
                                    <button
                                        onClick={() => setCorrectOption(key)}
                                        className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black transition-all ${correctOption === key ? 'bg-success text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                                    >
                                        {key}
                                    </button>
                                    <input
                                        type="text"
                                        value={value}
                                        onChange={(e) => setOptions({ ...options, [key]: e.target.value })}
                                        placeholder={`Digite a alternativa ${key}...`}
                                        className="flex-1 bg-transparent outline-none font-bold text-lg"
                                    />
                                    {correctOption === key && <CheckCircle2 className="w-5 h-5 text-success" />}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="p-8 rounded-[48px] bg-card border space-y-6 sticky top-8">
                        <h3 className="text-xl font-black flex items-center gap-3">
                            <Settings2 className="w-5 h-5 text-primary" />
                            Propriedades
                        </h3>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Disciplina</label>
                                <select
                                    className="w-full h-12 px-4 rounded-xl bg-muted border font-bold text-sm outline-none appearance-none"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                >
                                    <option>Direito Administrativo</option>
                                    <option>Direito Constitucional</option>
                                    <option>Português</option>
                                    <option>Raciocínio Lógico</option>
                                    <option>Atualidades</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Banca Examinadora</label>
                                <input
                                    type="text"
                                    value={banca}
                                    onChange={(e) => setBanca(e.target.value)}
                                    placeholder="Ex: VUNESP, CEBRASPE..."
                                    className="w-full h-12 px-4 rounded-xl bg-muted border font-bold text-sm outline-none"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Ano</label>
                                <input
                                    type="number"
                                    value={year}
                                    onChange={(e) => setYear(parseInt(e.target.value))}
                                    className="w-full h-12 px-4 rounded-xl bg-muted border font-bold text-sm outline-none"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Dificuldade</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { id: 'EASY', label: 'Fácil', color: 'success' },
                                        { id: 'MEDIUM', label: 'Médio', color: 'warning' },
                                        { id: 'HARD', label: 'Difícil', color: 'destructive' }
                                    ].map((d) => (
                                        <button
                                            key={d.id}
                                            onClick={() => setDifficulty(d.id as any)}
                                            className={`h-10 rounded-lg border font-bold text-[10px] uppercase transition-all ${difficulty === d.id
                                                    ? `bg-primary text-white border-primary`
                                                    : 'hover:bg-muted text-muted-foreground'
                                                }`}
                                        >
                                            {d.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10 space-y-3">
                            <div className="flex items-center gap-3 text-primary">
                                <HelpCircle className="w-4 h-4" />
                                <h4 className="font-black text-[10px] uppercase tracking-widest">Dica Premium</h4>
                            </div>
                            <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">
                                Questões de <strong>Quick Quiz</strong> devem ser mais diretas para garantir a fluidez do treino do aluno. Evite textos excessivamente longos nesta categoria.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
