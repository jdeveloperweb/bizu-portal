"use client";

import PageHeader from "../../../../../components/PageHeader";
import RichTextEditor from "../../../../../components/admin/RichTextEditor";
import {
    Save,
    ArrowLeft,
    HelpCircle,
    Settings2,
    CheckCircle2,
    FileText,
    Dumbbell,
    PlusCircle,
    Sparkles,
    Trash2,
    MinusCircle
} from "lucide-react";
import { Button } from "../../../../../components/ui/button";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function NovaQuestaoPage() {
    const router = useRouter();
    const [content, setContent] = useState("");
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
        <div className="relative min-h-screen">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 -z-10 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-40 left-0 -z-10 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="container mx-auto px-6 py-12 max-w-7xl relative">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16"
                >
                    <div className="space-y-6">
                        <Link
                            href="/admin/questoes"
                            className="group text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 hover:text-primary transition-all duration-300"
                        >
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-all">
                                <ArrowLeft className="w-4 h-4" />
                            </div>
                            Voltar para Banco
                        </Link>
                        <div className="relative">
                            <PageHeader
                                title="Cadastrar Questão"
                                description="Crie questões memoráveis com nosso editor potente."
                                badge="CMS PLATFORM"
                            />
                            <div className="absolute -left-12 top-10 w-1 h-12 bg-primary/20 rounded-full hidden lg:block" />
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            className="h-14 rounded-2xl font-black px-8 border-2 hover:bg-muted transition-all active:scale-95"
                        >
                            Salvar Rascunho
                        </Button>
                        <Button
                            onClick={handleSave}
                            className="h-14 rounded-2xl font-black px-12 gap-3 shadow-2xl shadow-primary/30 bg-gradient-to-r from-primary to-primary-dark border-none hover:opacity-90 active:scale-95 transition-all"
                        >
                            <Save className="w-5 h-5" />
                            Publicar Questão
                        </Button>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Main Content Area */}
                    <div className="lg:col-span-8 space-y-12">
                        {/* Modern Category Selector */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="flex flex-col gap-4"
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="w-4 h-4 text-primary" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Tipo de Conteúdo</span>
                            </div>
                            <div className="bg-muted/30 p-1.5 rounded-[32px] inline-flex gap-1 border border-muted/50 w-fit backdrop-blur-sm">
                                <button
                                    onClick={() => setCategory("SIMULADO")}
                                    className={`relative flex items-center gap-3 px-8 py-4 rounded-[26px] font-bold text-sm transition-all duration-500 overflow-hidden ${category === "SIMULADO" ? "text-primary shadow-xl" : "text-muted-foreground hover:text-foreground"}`}
                                >
                                    {category === "SIMULADO" && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute inset-0 bg-white shadow-lg shadow-black/5"
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                    <FileText className={`relative z-10 w-4 h-4 transition-transform duration-500 ${category === "SIMULADO" ? 'scale-110' : ''}`} />
                                    <span className="relative z-10">Simulado Oficial</span>
                                </button>
                                <button
                                    onClick={() => setCategory("QUIZ")}
                                    className={`relative flex items-center gap-3 px-8 py-4 rounded-[26px] font-bold text-sm transition-all duration-500 overflow-hidden ${category === "QUIZ" ? "text-primary shadow-xl" : "text-muted-foreground hover:text-foreground"}`}
                                >
                                    {category === "QUIZ" && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute inset-0 bg-white shadow-lg shadow-black/5"
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                    <Dumbbell className={`relative z-10 w-4 h-4 transition-transform duration-500 ${category === "QUIZ" ? 'scale-110' : ''}`} />
                                    <span className="relative z-10">Desafio Quick Quiz</span>
                                </button>
                            </div>
                        </motion.div>

                        {/* Question Editor */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="group"
                        >
                            <div className="flex items-center justify-between mb-4 px-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground group-focus-within:text-primary transition-colors flex items-center gap-2">
                                    <MinusCircle className="w-3 h-3" />
                                    Enunciado Principal
                                </label>
                                <span className="text-[10px] font-medium text-muted-foreground">Markdown Suportado</span>
                            </div>
                            <div className="relative rounded-[40px] overflow-hidden border-2 border-muted transition-all duration-500 group-focus-within:border-primary/30 group-focus-within:shadow-[0_0_40px_rgba(99,102,241,0.08)] bg-card">
                                <RichTextEditor
                                    content={content}
                                    onChange={setContent}
                                    placeholder="Comece a digitar o enunciado incrível da sua questão..."
                                />
                            </div>
                        </motion.div>

                        {/* Alternatives Section */}
                        <div className="space-y-10">
                            <div className="flex items-center justify-between border-b-2 border-muted pb-4">
                                <h3 className="text-xl font-extrabold flex items-center gap-3">
                                    <PlusCircle className="w-6 h-6 text-primary" />
                                    Alternativas
                                </h3>
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                    <span className="flex w-2 h-2 rounded-full bg-success" />
                                    Selecione a Correta
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                {Object.entries(options).map(([key, value], idx) => (
                                    <motion.div
                                        key={key}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 + (idx * 0.1) }}
                                        whileHover={{ y: -4 }}
                                        className={`flex items-stretch gap-6 p-2 pr-6 rounded-[32px] border-2 transition-all duration-500 ${correctOption === key
                                                ? 'border-success bg-success/[0.03] shadow-[0_20px_40px_-15px_rgba(5,150,105,0.12)]'
                                                : 'border-muted hover:border-primary/20 bg-card hover:shadow-[0_15px_30px_-10px_rgba(0,0,0,0.05)]'
                                            }`}
                                    >
                                        <button
                                            onClick={() => setCorrectOption(key)}
                                            className={`w-16 h-16 rounded-[24px] flex items-center justify-center text-xl font-black transition-all duration-500 group relative overflow-hidden ${correctOption === key
                                                    ? 'bg-success text-white shadow-lg shadow-success/30'
                                                    : 'bg-muted/50 text-muted-foreground hover:bg-primary/10 hover:text-primary'
                                                }`}
                                        >
                                            <span className="relative z-10">{key}</span>
                                            {correctOption === key && (
                                                <motion.div
                                                    layoutId="checkGlow"
                                                    className="absolute inset-0 bg-gradient-to-br from-success/50 to-emerald-600/50"
                                                />
                                            )}
                                        </button>

                                        <div className="flex-1 flex items-center">
                                            <input
                                                type="text"
                                                value={value}
                                                onChange={(e) => setOptions({ ...options, [key]: e.target.value })}
                                                placeholder={`Escreva a alternativa ${key}...`}
                                                className={`w-full bg-transparent outline-none font-bold text-lg placeholder:text-muted-foreground/30 transition-all ${correctOption === key ? 'text-success-800' : 'text-foreground'
                                                    }`}
                                            />
                                        </div>

                                        <div className="flex items-center">
                                            {correctOption === key ? (
                                                <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center text-success">
                                                    <CheckCircle2 className="w-6 h-6" />
                                                </div>
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-muted/30 flex items-center justify-center text-muted-foreground opacity-20 transition-opacity hover:opacity-100">
                                                    <Trash2 className="w-4 h-4" />
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Area */}
                    <div className="lg:col-span-4 lg:pl-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5 }}
                            className="sticky top-12 p-8 rounded-[48px] bg-card border-2 border-muted/50 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] space-y-8 backdrop-blur-md"
                        >
                            <div className="relative">
                                <h3 className="text-2xl font-black flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                        <Settings2 className="w-6 h-6" />
                                    </div>
                                    Propriedades
                                </h3>
                                <div className="absolute top-1/2 -right-4 w-1 h-8 bg-primary/30 rounded-full" />
                            </div>

                            <div className="space-y-6">
                                {/* Subject Selector */}
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Disciplina</label>
                                    <div className="relative group">
                                        <select
                                            className="w-full h-14 px-5 pr-10 rounded-2xl bg-muted/30 border-2 border-transparent focus:border-primary/30 focus:bg-white font-bold text-sm outline-none appearance-none transition-all cursor-pointer"
                                            value={subject}
                                            onChange={(e) => setSubject(e.target.value)}
                                        >
                                            <option>Direito Administrativo</option>
                                            <option>Direito Constitucional</option>
                                            <option>Português</option>
                                            <option>Raciocínio Lógico</option>
                                            <option>Atualidades</option>
                                        </select>
                                        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                                            <PlusCircle className="w-4 h-4 rotate-45" />
                                        </div>
                                    </div>
                                </div>

                                {/* Banca Input */}
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Banca Examinadora</label>
                                    <input
                                        type="text"
                                        value={banca}
                                        onChange={(e) => setBanca(e.target.value)}
                                        placeholder="Ex: VUNESP, CEBRASPE..."
                                        className="w-full h-14 px-5 rounded-2xl bg-muted/30 border-2 border-transparent focus:border-primary/30 focus:bg-white font-bold text-sm outline-none transition-all"
                                    />
                                </div>

                                {/* Year & Difficulty Grid */}
                                <div className="grid grid-cols-1 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Ano da Questão</label>
                                        <input
                                            type="number"
                                            value={year}
                                            onChange={(e) => setYear(parseInt(e.target.value))}
                                            className="w-full h-14 px-5 rounded-2xl bg-muted/30 border-2 border-transparent focus:border-primary/30 focus:bg-white font-black text-sm outline-none transition-all"
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Grau de Dificuldade</label>
                                        <div className="bg-muted/30 p-1.5 rounded-2xl grid grid-cols-3 gap-1.5 border border-muted/50">
                                            {[
                                                { id: 'EASY', label: 'Fácil', color: 'bg-success' },
                                                { id: 'MEDIUM', label: 'Médio', color: 'bg-amber-500' },
                                                { id: 'HARD', label: 'Difícil', color: 'bg-destructive' }
                                            ].map((d) => (
                                                <button
                                                    key={d.id}
                                                    onClick={() => setDifficulty(d.id as any)}
                                                    className={`h-11 rounded-xl font-bold text-[10px] uppercase transition-all flex flex-col items-center justify-center gap-1 ${difficulty === d.id
                                                            ? `bg-white text-foreground shadow-sm ring-2 ring-primary/10`
                                                            : 'hover:text-foreground text-muted-foreground'
                                                        }`}
                                                >
                                                    <span className={`w-1.5 h-1.5 rounded-full ${difficulty === d.id ? d.color : 'bg-muted-foreground/30'}`} />
                                                    {d.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Premium Tip Card */}
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                className="relative p-6 rounded-[32px] bg-gradient-to-br from-indigo-500/10 to-primary/5 border border-primary/20 space-y-4 overflow-hidden"
                            >
                                <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
                                <div className="flex items-center gap-3 text-primary">
                                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                                        <HelpCircle className="w-4 h-4" />
                                    </div>
                                    <h4 className="font-black text-[10px] uppercase tracking-widest">Dica Estratégica</h4>
                                </div>
                                <p className="text-[11px] text-muted-foreground font-medium leading-[1.8] relative z-10">
                                    Questões de <strong className="text-primary">Quick Quiz</strong> devem ser curtas. Se o enunciado for muito longo, considere usar o modo <strong className="text-indigo-600">Simulado</strong> para uma melhor experiência do aluno.
                                </p>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}
