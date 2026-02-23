"use client";

import { useState, useEffect } from "react";
import PageHeader from "@/components/PageHeader";
import {
    Users,
    Search,
    Filter,
    Download,
    Mail,
    Calendar,
    Shield,
    ExternalLink,
    MoreHorizontal
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function AdminUsuariosPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${apiUrl}/admin/users`);
            if (res.ok) {
                const data = await res.json();

                // Formatar dados para o frontend (e.g. formatar data "Jan 20, 2026")
                const formattedUsers = data.map((u: any) => ({
                    ...u,
                    joined: new Date(u.joined).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric', year: 'numeric' })
                }));

                setUsers(formattedUsers);
            }
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);
    return (
        <div className="container mx-auto px-4 py-12 max-w-7xl">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <PageHeader
                    title="Gestão de Alunos"
                    description="Monitore o progresso, planos e atividades de todos os usuários cadastrados."
                    badge="COMMUNITY"
                />
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="h-14 rounded-2xl font-black gap-2 border-primary/20 hover:bg-primary/5">
                        <Download className="w-4 h-4" />
                        Exportar CSV
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="md:col-span-2 relative">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Buscar por nome, e-mail ou CPF..."
                        className="w-full h-16 pl-14 pr-6 rounded-3xl bg-card border border-primary/5 focus:border-primary outline-none transition-all font-medium text-lg shadow-sm"
                    />
                </div>
                <div className="flex gap-4">
                    <Button variant="outline" className="h-16 flex-1 rounded-3xl gap-2 font-black border-primary/5 hover:bg-primary/5">
                        <Filter className="w-5 h-5 text-primary" />
                        Filtros
                    </Button>
                    <div className="h-16 px-6 rounded-3xl bg-card border border-primary/5 flex items-center justify-center font-black text-primary">
                        {users.length} ALUNOS
                    </div>
                </div>
            </div>

            <div className="bg-card border rounded-[48px] overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-muted/50 border-b">
                        <tr>
                            <th className="px-8 py-5 text-xs font-black text-muted-foreground uppercase tracking-widest">Aluno</th>
                            <th className="px-8 py-5 text-xs font-black text-muted-foreground uppercase tracking-widest">Plano</th>
                            <th className="px-8 py-5 text-xs font-black text-muted-foreground uppercase tracking-widest">Cadastro</th>
                            <th className="px-8 py-5 text-xs font-black text-muted-foreground uppercase tracking-widest text-center">Progresso</th>
                            <th className="px-8 py-5 text-xs font-black text-muted-foreground uppercase tracking-widest text-right">Ação</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {isLoading ? (
                            <tr>
                                <td colSpan={5} className="px-8 py-6 text-center text-muted-foreground font-medium">
                                    Carregando alunos...
                                </td>
                            </tr>
                        ) : users.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-8 py-6 text-center text-muted-foreground font-medium">
                                    Nenhum aluno cadastrado.
                                </td>
                            </tr>
                        ) : users.map((user: any) => (
                            <tr key={user.id} className="hover:bg-muted/30 transition-colors group">
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center font-bold text-sm">
                                            {user.name ? user.name.substring(0, 2).toUpperCase() : 'NA'}
                                        </div>
                                        <div>
                                            <div className="font-bold">{user.name || 'Sem Nome'}</div>
                                            <div className="text-xs text-muted-foreground font-medium flex items-center gap-2">
                                                <Mail className="w-3 h-3" />
                                                {user.email || 'Sem e-mail'}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${user.plan === 'Diamond' ? 'bg-purple-100 text-purple-600' : 'bg-muted text-muted-foreground'}`}>
                                        <Shield className="w-3 h-3" />
                                        {user.plan || 'Nenhum'}
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                                        <Calendar className="w-3.5 h-3.5" />
                                        {user.joined}
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-center">
                                    <span className="font-black text-primary bg-primary/10 px-3 py-1 rounded-lg text-xs">{user.xp || '0 XP'}</span>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <Button variant="ghost" size="sm" className="rounded-xl h-10 w-10 p-0 hover:bg-muted opacity-0 group-hover:opacity-100 transition-all">
                                        <ExternalLink className="w-4 h-4 text-muted-foreground" />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
