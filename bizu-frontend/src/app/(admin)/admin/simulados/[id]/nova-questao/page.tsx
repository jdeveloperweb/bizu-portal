"use client";

import PageHeader from "../../../../../../components/PageHeader";
import RichTextEditor from "../../../../../../components/admin/RichTextEditor";
import {
    Save,
    ArrowLeft,
    HelpCircle,
    Settings2,
    CheckCircle2,
    PlusCircle,
    Trash2,
    MinusCircle
} from "lucide-react";
import { Button } from "../../../../../../components/ui/button";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";

import { apiFetch } from "@/lib/api";

export default function NovaQuestaoSimuladoPage() {
    const router = useRouter();
    const params = useParams();
    const simuladoId = params.id as string;

    const [content, setContent] = useState("");
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

    const [simulado, setSimulado] = useState<any>(null);
    const [modules, setModules] = useState<any[]>([]);
    const [selectedModuleId, setSelectedModuleId] = useState<string>("");

    useEffect(() => {
        apiFetch(`/admin/simulados/${simuladoId}`)
            .then(res => res.json())
            .then(data => {
                setSimulado(data);
                if (data.course) {
                    apiFetch(`/admin/modules/course/${data.course.id}`)
                        .then(r => r.json())
                        .then(mods => {
                            if (Array.isArray(mods)) setModules(mods);
                        });
                }
            })
            .catch(err => console.error("Error fetching simulado/modules", err));
    }, [simuladoId]);

    const handleSave = async () => {
        try {
            const res = await apiFetch(`/admin/simulados/${simuladoId}/questions`, {
                method: "POST",
                body: JSON.stringify({
                    statement: content,
                    difficulty,
                    subject,
                    banca,
                    year,
                    options,
                    correctOption,
                    questionType: "MULTIPLE_CHOICE",
                    module: selectedModuleId ? { id: selectedModuleId } : null
                })
            });

            if (res.ok) {
                router.push(`/admin/simulados/${simuladoId}`);
            }
        } catch (error) {
            console.error("Failed to save question to simulado", error);
        }
    };

    return (
        <div className="relative min-h-screen">
            <div className="absolute top-0 right-0 -z-10 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-40 left-0 -z-10 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="container mx-auto px-6 py-12 max-w-7xl relative">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16"
                >
                    <div className="space-y-6">
                        <Link
                            href={`/admin/simulados/${simuladoId}`}
                            className="group text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 hover:text-primary transition-all duration-300"
                        >
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-all">
                                <ArrowLeft className="w-4 h-4" />
                            </div>
                            Voltar para Detalhes do Simulado
                        </Link>
                        <div className="relative">
                            <PageHeader
                                title="Cadastrar Questão no Simulado"
                                description="Esta questão fará parte exclusiva e direta deste simulado."
                                badge="CMS PLATFORM"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button
                            onClick={handleSave}
                            className="h-14 rounded-2xl font-black px-12 gap-3 shadow-2xl shadow-primary/30 bg-gradient-to-r from-primary to-primary-dark border-none hover:opacity-90 active:scale-95 transition-all"
                        >
                            <Save className="w-5 h-5" />
                            Salvar Questão
                        </Button>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    <div className="lg:col-span-8 space-y-12">
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
                            </div>
                            <div className="relative rounded-[40px] overflow-hidden border-2 border-muted transition-all duration-500 group-focus-within:border-primary/30 group-focus-within:shadow-[0_0_40px_rgba(99,102,241,0.08)] bg-card">
                                <RichTextEditor
                                    content={content}
                                    onChange={setContent}
                                    placeholder="Comece a digitar o enunciado incrível da sua questão..."
                                />
                            </div>
                        </motion.div>

                        <div className="space-y-10">
                            <div className="flex items-center justify-between border-b-2 border-muted pb-4">
                                <h3 className="text-xl font-extrabold flex items-center gap-3">
                                    <PlusCircle className="w-6 h-6 text-primary" />
                                    Alternativas
                                </h3>
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
                            </div>

                            <div className="space-y-6">
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
                                            <Settings2 className="w-4 h-4 rotate-45" />
                                        </div>
                                    </div>
                                </div>

                                {/* Module Selector */}
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary ml-1">Módulo do Curso</label>
                                    <div className="relative group">
                                        <select
                                            className="w-full h-14 px-5 pr-10 rounded-2xl bg-primary/5 border-2 border-primary/10 focus:border-primary/30 focus:bg-white font-bold text-sm outline-none appearance-none transition-all cursor-pointer"
                                            value={selectedModuleId}
                                            onChange={(e) => setSelectedModuleId(e.target.value)}
                                        >
                                            <option value="">Selecione um módulo...</option>
                                            {modules.map(module => (
                                                <option key={module.id} value={module.id}>{module.title}</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                                            <PlusCircle className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>

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
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}
