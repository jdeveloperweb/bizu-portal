"use client";

import PageHeader from "@/components/PageHeader";
import {
    CreditCard,
    Plus,
    CheckCircle2,
    XCircle,
    Edit2,
    Trash2,
    Users,
    BookOpen,
    Save,
    X
} from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { apiFetch } from "@/lib/api";

export default function AdminPlanosPage() {
    const [plans, setPlans] = useState<any[]>([]);
    const [courses, setCourses] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<any>(null);

    const fetchPlans = async () => {
        setIsLoading(true);
        try {
            const res = await apiFetch("/admin/plans");
            if (res.ok) {
                const data = await res.json();
                setPlans(data);
            }
        } catch (error) {
            console.error("Failed to fetch plans", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchCourses = async () => {
        try {
            const res = await apiFetch("/admin/courses");
            if (res.ok) {
                const data = await res.json();
                setCourses(data);
            }
        } catch (error) {
            console.error("Failed to fetch courses", error);
        }
    };

    useEffect(() => {
        fetchPlans();
        fetchCourses();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm("Deseja realmente excluir este plano?")) return;
        try {
            const res = await apiFetch(`/admin/plans/${id}`, { method: "DELETE" });
            if (res.ok) {
                setPlans(prev => prev.filter(p => p.id !== id));
            }
        } catch (error) {
            console.error("Failed to delete plan", error);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const method = editingPlan.id ? "PUT" : "POST";
        const url = editingPlan.id ? `/admin/plans/${editingPlan.id}` : "/admin/plans";

        try {
            const res = await apiFetch(url, {
                method,
                body: JSON.stringify(editingPlan)
            });

            if (res.ok) {
                setIsModalOpen(false);
                fetchPlans();
            }
        } catch (error) {
            console.error("Failed to save plan", error);
        }
    };

    const openCreateModal = () => {
        setEditingPlan({
            name: "",
            description: "",
            price: 0,
            billingInterval: "MONTHLY",
            active: true,
            group: false,
            maxMembers: 1,
            devicesPerUser: 3,
            course: null,
            features: "[]",
            highlight: false,
            badge: "",
            sortOrder: 0
        });
        setIsModalOpen(true);
    };

    const openEditModal = (plan: any) => {
        setEditingPlan(plan);
        setIsModalOpen(true);
    };

    return (
        <div className="w-full px-8 py-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <PageHeader
                    title="Gestão de Planos"
                    description="Controle os produtos, preços e acessos vinculados aos seus cursos."
                    badge="PRODUCTS"
                />
                <Button
                    onClick={openCreateModal}
                    className="h-14 rounded-xl font-black text-lg gap-2 shadow-xl shadow-primary/20"
                >
                    <Plus className="w-5 h-5" />
                    Novo Plano
                </Button>
            </div>

            <div className="bg-card border rounded-2xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-muted/50 border-b">
                        <tr>
                            <th className="px-8 py-5 text-xs font-black text-muted-foreground uppercase tracking-widest">Plano / Curso</th>
                            <th className="px-8 py-5 text-xs font-black text-muted-foreground uppercase tracking-widest">Preço</th>
                            <th className="px-8 py-5 text-xs font-black text-muted-foreground uppercase tracking-widest">Tipo</th>
                            <th className="px-8 py-5 text-xs font-black text-muted-foreground uppercase tracking-widest">Status</th>
                            <th className="px-8 py-5 text-xs font-black text-muted-foreground uppercase tracking-widest text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {isLoading ? (
                            <tr>
                                <td colSpan={5} className="px-8 py-10 text-center text-muted-foreground font-medium">Carregando planos...</td>
                            </tr>
                        ) : plans.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-8 py-10 text-center text-muted-foreground font-medium">Nenhum plano cadastrado.</td>
                            </tr>
                        ) : plans.map((plan) => (
                            <tr key={plan.id} className="hover:bg-muted/30 transition-colors group">
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${plan.active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                            {plan.group ? <Users className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <div className="font-bold">{plan.name}</div>
                                            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-black uppercase tracking-widest">
                                                <BookOpen className="w-3 h-3" />
                                                {plan.course?.title || "Sem curso vinculado"}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6 font-bold">R$ {plan.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                <td className="px-8 py-6">
                                    <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                        {plan.billingInterval}
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    {plan.active ? (
                                        <div className="flex items-center gap-1.5 text-success font-black text-[10px] uppercase tracking-widest">
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                            Ativo
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1.5 text-muted-foreground font-black text-[10px] uppercase tracking-widest">
                                            <XCircle className="w-3.5 h-3.5" />
                                            Inativo
                                        </div>
                                    )}
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => openEditModal(plan)}
                                            className="rounded-xl h-10 w-10 p-0 hover:bg-muted"
                                        >
                                            <Edit2 className="w-4 h-4 text-primary" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDelete(plan.id)}
                                            className="rounded-xl h-10 w-10 p-0 hover:bg-destructive/10"
                                        >
                                            <Trash2 className="w-4 h-4 text-destructive" />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="bg-card w-full max-w-2xl rounded-2xl p-8 shadow-2xl border my-8">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-black">{editingPlan.id ? "Editar Plano" : "Novo Plano"}</h2>
                            <Button variant="ghost" className="rounded-full w-10 h-10 p-0" onClick={() => setIsModalOpen(false)}>
                                <X className="w-6 h-6" />
                            </Button>
                        </div>

                        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4 md:col-span-2">
                                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Nome do Plano</label>
                                <Input
                                    required
                                    value={editingPlan.name}
                                    onChange={e => setEditingPlan({ ...editingPlan, name: e.target.value })}
                                    placeholder="Ex: Assinatura Premium"
                                    className="h-12 rounded-xl"
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Curso Vinculado</label>
                                <select
                                    required
                                    className="flex h-12 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                                    value={editingPlan.course?.id || ""}
                                    onChange={e => {
                                        const course = courses.find(c => c.id === e.target.value);
                                        setEditingPlan({ ...editingPlan, course });
                                    }}
                                >
                                    <option value="">Selecione um curso...</option>
                                    {courses.map(course => (
                                        <option key={course.id} value={course.id}>{course.title}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-4">
                                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Preço (BRL)</label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={editingPlan.price}
                                    onChange={e => setEditingPlan({ ...editingPlan, price: parseFloat(e.target.value) })}
                                    className="h-12 rounded-xl"
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Intervalo</label>
                                <select
                                    className="flex h-12 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                                    value={editingPlan.billingInterval}
                                    onChange={e => setEditingPlan({ ...editingPlan, billingInterval: e.target.value })}
                                >
                                    <option value="MONTHLY">Mensal</option>
                                    <option value="YEARLY">Anual</option>
                                    <option value="ONE_TIME">Pagamento Único (Vitalício)</option>
                                </select>
                            </div>

                            <div className="space-y-4">
                                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Ordem de Exibição</label>
                                <Input
                                    type="number"
                                    value={editingPlan.sortOrder}
                                    onChange={e => setEditingPlan({ ...editingPlan, sortOrder: parseInt(e.target.value) })}
                                    className="h-12 rounded-xl"
                                />
                            </div>

                            <div className="space-y-4 md:col-span-2">
                                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Descrição curta</label>
                                <Input
                                    value={editingPlan.description}
                                    onChange={e => setEditingPlan({ ...editingPlan, description: e.target.value })}
                                    placeholder="Frase curta de impacto"
                                    className="h-12 rounded-xl"
                                />
                            </div>

                            <div className="space-y-4 md:col-span-2">
                                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Benefícios (Um por linha)</label>
                                <textarea
                                    className="flex w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring min-h-[120px]"
                                    value={editingPlan.features ? JSON.parse(editingPlan.features).join('\n') : ""}
                                    onChange={e => {
                                        const lines = e.target.value.split('\n').filter(l => l.trim() !== "");
                                        setEditingPlan({ ...editingPlan, features: JSON.stringify(lines) });
                                    }}
                                    placeholder="Ex: Banco de questões&#10;Simulados ilimitados"
                                />
                            </div>

                            <div className="flex flex-wrap gap-6 md:col-span-2 py-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={editingPlan.active}
                                        onChange={e => setEditingPlan({ ...editingPlan, active: e.target.checked })}
                                        className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <span className="text-sm font-bold">Ativo</span>
                                </label>

                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={editingPlan.highlight}
                                        onChange={e => setEditingPlan({ ...editingPlan, highlight: e.target.checked })}
                                        className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <span className="text-sm font-bold">Destaque (Popular)</span>
                                </label>

                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={editingPlan.group}
                                        onChange={e => setEditingPlan({ ...editingPlan, group: e.target.checked })}
                                        className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <span className="text-sm font-bold">Plano em Grupo</span>
                                </label>
                            </div>

                            {editingPlan.group && (
                                <div className="space-y-4">
                                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Max. Membros</label>
                                    <Input
                                        type="number"
                                        value={editingPlan.maxMembers}
                                        onChange={e => setEditingPlan({ ...editingPlan, maxMembers: parseInt(e.target.value) })}
                                        className="h-12 rounded-xl"
                                    />
                                </div>
                            )}

                            <div className="flex gap-4 md:col-span-2 pt-6">
                                <Button type="button" variant="outline" className="flex-1 h-12 rounded-xl font-bold" onClick={() => setIsModalOpen(false)}>
                                    Cancelar
                                </Button>
                                <Button type="submit" className="flex-1 h-12 rounded-xl font-bold gap-2">
                                    <Save className="w-4 h-4" />
                                    Salvar Plano
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
