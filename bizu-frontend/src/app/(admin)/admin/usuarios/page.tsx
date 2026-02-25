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
    Trash2,
    TrendingUp
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";

export default function AdminUsuariosPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // User Editing State
    const [isEditing, setIsEditing] = useState(false);
    const [editingUser, setEditingUser] = useState<any>(null);
    const [plans, setPlans] = useState<any[]>([]);
    const [formUser, setFormUser] = useState({
        name: "",
        email: "",
        planId: "",
        months: 12
    });

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const res = await apiFetch("/admin/users");
            if (res.ok) {
                const data = await res.json();
                const formattedUsers = data.map((u: any) => ({
                    ...u,
                    joined: u.joined ? new Date(u.joined).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'
                }));
                setUsers(formattedUsers);
            }
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchPlans = async () => {
        try {
            const res = await apiFetch("/admin/plans");
            if (res.ok) {
                const data = await res.json();
                setPlans(data);
            }
        } catch (error) {
            console.error("Failed to fetch plans", error);
        }
    };

    const handleEditClick = (user: any) => {
        setEditingUser(user);
        setFormUser({
            name: user.name || "",
            email: user.email || "",
            planId: user.planId || "",
            months: 12
        });
        setIsEditing(true);
        fetchPlans();
    };

    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await apiFetch(`/admin/users/${editingUser.id}`, {
                method: "PUT",
                body: JSON.stringify({
                    name: formUser.name,
                    email: formUser.email,
                    planId: formUser.planId || null,
                    months: formUser.months
                })
            });

            if (res.ok) {
                await fetchUsers();
                setIsEditing(false);
                setEditingUser(null);
            } else {
                const err = await res.text();
                alert("Falha ao atualizar usuário: " + err);
            }
        } catch (error) {
            console.error("Failed to update user", error);
            alert("Erro ao atualizar usuário.");
        }
    };

    const handleDeleteUser = async (id: string, name: string) => {
        if (!confirm(`Tem certeza que deseja apagar o usuário ${name}? Esta ação é irreversível e removerá o acesso dele permanentemente.`)) {
            return;
        }

        try {
            const res = await apiFetch(`/admin/users/${id}`, { method: "DELETE" });
            if (res.ok) {
                setUsers(prev => prev.filter(u => u.id !== id));
            } else {
                alert("Falha ao apagar usuário.");
            }
        } catch (error) {
            console.error("Failed to delete user", error);
            alert("Erro ao tentar apagar usuário.");
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const filteredUsers = users.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -10 },
        visible: { opacity: 1, x: 0 }
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="w-full px-8 py-10"
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <PageHeader
                    title="Gestão de Alunos"
                    description="Monitore o progresso, planos e atividades de todos os usuários cadastrados."
                    badge="COMMUNITY"
                />
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button variant="outline" className="btn-ghost border-slate-200 h-11 px-6 rounded-xl gap-2 hover:border-primary/30">
                        <Download className="w-4 h-4" />
                        Exportar CSV
                    </Button>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-10">
                <div className="lg:col-span-2 relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Buscar por nome ou e-mail..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input-field pl-10 h-12 shadow-sm border-slate-200 focus:ring-primary/10"
                    />
                </div>
                <div className="flex gap-4 lg:col-span-2">
                    <Button variant="outline" className="h-12 flex-1 rounded-xl gap-2 font-bold border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all text-slate-600">
                        <Filter className="w-4 h-4 text-slate-400" />
                        Filtros
                    </Button>
                    <div className="h-12 px-5 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center font-bold text-slate-700 gap-3 min-w-[160px]">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Users className="w-4 h-4 text-primary" />
                        </div>
                        <span className="text-sm tracking-tight"><span className="text-primary font-black text-lg">{users.length}</span> ALUNOS</span>
                    </div>
                </div>
            </div>

            <motion.div variants={itemVariants} className="card-elevated overflow-hidden border-none shadow-xl shadow-slate-200/50">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-8 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Aluno</th>
                                <th className="px-8 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Plano / Curso</th>
                                <th className="px-8 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Cadastro</th>
                                <th className="px-8 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Progresso</th>
                                <th className="px-8 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-right">Ação</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            <AnimatePresence mode="popLayout">
                                {isLoading ? (
                                    <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                        <td colSpan={5} className="px-8 py-16 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                                                <span className="text-sm font-medium text-slate-400">Carregando alunos...</span>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ) : filteredUsers.length === 0 ? (
                                    <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                        <td colSpan={5} className="px-8 py-16 text-center text-slate-400 font-medium">
                                            <div className="flex flex-col items-center gap-2">
                                                <Search className="w-8 h-8 opacity-20" />
                                                <span>Nenhum aluno encontrado.</span>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ) : filteredUsers.map((user: any) => (
                                    <motion.tr
                                        layout
                                        key={user.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="hover:bg-slate-50/50 transition-colors group relative"
                                    >
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center font-bold text-primary text-xs border border-primary/10">
                                                    {user.name ? user.name.substring(0, 2).toUpperCase() : 'NA'}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-900 leading-tight mb-0.5">{user.name || 'Sem Nome'}</div>
                                                    <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                                                        <Mail className="w-3 h-3" />
                                                        {user.email || 'Sem e-mail'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col gap-1">
                                                <span className={`pill text-[10px] w-fit ${user.plan === 'FREE' ? 'pill-success' : 'pill-primary'
                                                    } uppercase tracking-wider`}>
                                                    <Shield className="w-3 h-3" />
                                                    {user.plan || 'Free'}
                                                </span>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight ml-1">
                                                    {user.courseTitle || 'Nenhum curso'}
                                                </span>
                                                {user.currentPeriodEnd && (
                                                    <span className="text-[9px] font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100 w-fit mt-1">
                                                        Expira: {new Date(user.currentPeriodEnd).toLocaleDateString('pt-BR')}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                {user.joined}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-center">
                                            <div className="inline-flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                                <TrendingUp className="w-3 h-3 text-emerald-500" />
                                                <span className="font-bold text-slate-700 text-xs">{user.xp || '0'} XP</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-1 group-hover:translate-x-0">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleEditClick(user)}
                                                    className="rounded-lg h-9 w-9 text-slate-400 hover:text-primary hover:bg-primary/5"
                                                    title="Editar Usuário"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDeleteUser(user.id, user.name)}
                                                    className="rounded-lg h-9 w-9 text-slate-400 hover:text-red-500 hover:bg-red-50"
                                                    title="Apagar Usuário"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* Modal de Edição */}
            <AnimatePresence>
                {isEditing && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl border border-slate-100"
                        >
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                                    <Users className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-slate-900 leading-tight">Editar Usuário</h2>
                                    <p className="text-sm font-medium text-slate-400">ID: {editingUser.id.substring(0, 8)}...</p>
                                </div>
                            </div>

                            <form onSubmit={handleUpdateUser} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Nome Completo</label>
                                    <input
                                        autoFocus
                                        required
                                        placeholder="Nome do aluno"
                                        value={formUser.name}
                                        onChange={e => setFormUser({ ...formUser, name: e.target.value })}
                                        className="input-field h-12 px-4 rounded-xl border-slate-200 focus:ring-primary/10"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">E-mail</label>
                                    <input
                                        required
                                        type="email"
                                        placeholder="email@exemplo.com"
                                        value={formUser.email}
                                        onChange={e => setFormUser({ ...formUser, email: e.target.value })}
                                        className="input-field h-12 px-4 rounded-xl border-slate-200 focus:ring-primary/10"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Plano & Curso</label>
                                    <select
                                        value={formUser.planId}
                                        onChange={e => setFormUser({ ...formUser, planId: e.target.value })}
                                        className="flex w-full h-12 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all appearance-none"
                                    >
                                        <option value="">Plano Free (Sem curso vinculado)</option>
                                        {plans.map((plan: any) => (
                                            <option key={plan.id} value={plan.id}>
                                                {plan.name} {plan.course ? `(${plan.course.title})` : ''} - R$ {plan.price}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {formUser.planId && (
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Duração do Acesso</label>
                                        <select
                                            value={formUser.months}
                                            onChange={e => setFormUser({ ...formUser, months: parseInt(e.target.value) })}
                                            className="flex w-full h-12 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all appearance-none"
                                        >
                                            <option value={1}>1 Mês (Mensal)</option>
                                            <option value={3}>3 Meses (Trimestral)</option>
                                            <option value={6}>6 Meses (Semestral)</option>
                                            <option value={12}>12 Meses (Anual)</option>
                                            <option value={24}>24 Meses (2 Anos)</option>
                                        </select>
                                    </div>
                                )}

                                <div className="flex gap-4 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="flex-1 h-12 rounded-2xl font-bold border-slate-200 text-slate-500 hover:bg-slate-50"
                                        onClick={() => {
                                            setIsEditing(false);
                                            setEditingUser(null);
                                        }}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button type="submit" className="flex-1 h-12 rounded-2xl font-black shadow-lg shadow-primary/20">
                                        Salvar Alterações
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
