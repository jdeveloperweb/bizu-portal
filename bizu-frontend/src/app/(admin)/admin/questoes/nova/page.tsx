"use client";

import PageHeader from "../../../../../components/PageHeader";
import RichTextEditor from "../../../../../components/admin/RichTextEditor";
import {
    Save,
    ArrowLeft,
    HelpCircle,
    Settings2,
    CheckCircle2,
    Layout
} from "lucide-react";
import { Button } from "../../../../../components/ui/button";
import { useState } from "react";
import Link from "next/link";

export default function NovaQuestaoPage() {
    const [content, setContent] = useState("");
    const [title, setTitle] = useState("");
    const [subject, setSubject] = useState("Direito Administrativo");

    return (
        <div className="container mx-auto px-4 py-12 max-w-5xl">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div className="space-y-4">
                    <Link href="/admin/questoes" className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 hover:text-primary transition-colors">
                        <ArrowLeft className="w-3 h-3" />
                        Voltar para Banco
                    </Link>
                    <PageHeader
                        title="Cadastrar Questão"
                        description="Use o editor rico para formatar enunciados, incluir tabelas ou fórmulas."
                        badge="CMS"
                    />
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="h-14 rounded-2xl font-black px-8">Salvar Rascunho</Button>
                    <Button className="h-14 rounded-2xl font-black px-12 gap-2 shadow-xl shadow-primary/20">
                        <Save className="w-5 h-5" />
                        Publicar Questão
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-8">
                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Título da Questão (Interno)</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Ex: Questão sobre Atos Administrativos - VUNESP 2024"
                            className="w-full h-16 px-6 rounded-3xl bg-card border focus:border-primary outline-none transition-all font-bold text-lg"
                        />
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Enunciado Principal</label>
                        <RichTextEditor
                            content={content}
                            onChange={setContent}
                            placeholder="Escreva o enunciado completo aqui. Use negrito para destacar trechos importantes."
                        />
                    </div>

                    <div className="p-8 rounded-[48px] bg-muted/30 border border-dashed text-center space-y-4">
                        <Layout className="w-10 h-10 mx-auto text-muted-foreground" />
                        <div>
                            <div className="font-bold">Visualização do Aluno</div>
                            <p className="text-xs text-muted-foreground font-medium italic">O conteúdo acima será renderizado exatamente desta forma para o estudante.</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="p-8 rounded-[48px] bg-card border space-y-6">
                        <h3 className="text-xl font-black flex items-center gap-3">
                            <Settings2 className="w-5 h-5 text-primary" />
                            Propriedades
                        </h3>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Disciplina</label>
                                <select className="w-full h-12 px-4 rounded-xl bg-muted border font-bold text-sm outline-none">
                                    <option>Direito Administrativo</option>
                                    <option>Direito Constitucional</option>
                                    <option>Português</option>
                                    <option>Raciocínio Lógico</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Dificuldade</label>
                                <div className="grid grid-cols-3 gap-2">
                                    <button className="h-10 rounded-lg border font-bold text-[10px] uppercase bg-success/10 text-success border-success/30">Fácil</button>
                                    <button className="h-10 rounded-lg border font-bold text-[10px] uppercase hover:bg-muted">Médio</button>
                                    <button className="h-10 rounded-lg border font-bold text-[10px] uppercase hover:bg-muted">Difícil</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 rounded-[48px] bg-primary/5 border border-primary/20 space-y-4">
                        <div className="flex items-center gap-3 text-primary">
                            <HelpCircle className="w-5 h-5" />
                            <h4 className="font-black text-sm uppercase tracking-widest">Dica de SEO</h4>
                        </div>
                        <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                            Certifique-se de incluir as palavras-chave da banca e o ano da prova. Isso ajuda na organização e na busca interna dos alunos.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
