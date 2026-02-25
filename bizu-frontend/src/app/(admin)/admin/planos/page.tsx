"use client";

import PageHeader from "../../../../components/PageHeader";
import {
    Plus,
    Search,
    MoreVertical,
    Edit2,
    Trash2,
    CreditCard,
    CheckCircle2,
    XCircle,
    Loader2,
    Save,
    X,
    Layout
} from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";

interface Plan {
    id?: string;
    name: string;
    description: string;
    price: number;
    currency: string;
    billingInterval: string;
    active: boolean;
    features: string;
    highlight: boolean;
    badge: string;
    sortOrder: number;
}

export default function AdminPlanosPage() {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState<Plan>({
        name: "",
        description: "",
        price: 0,
        currency: "BRL",
        billingInterval: "MONTHLY",
        active: true,
        features: '[]',
        highlight: false,
        badge: "",
        sortOrder: 0
    });

    const fetchPlans = async () => {
        setLoading(true);
        try {
            const res = await apiFetch("/admin/plans");
            if (res.ok) {
                const data = await res.json();
                setPlans(data);
            }
        } catch (error) {
            toast.error("Erro ao carregar planos");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlans();
    }, []);

    const handleOpenModal = (plan?: Plan) => {
        if (plan) {
            setEditingPlan(plan);
            setForm(plan);
        } else {
            setEditingPlan(null);
            setForm({
                name: "",
                description: "",
                price: 0,
                currency: "BRL",
                billingInterval: "MONTHLY",
                active: true,
                features: '[]',
                highlight: false,
                badge: "",
                sortOrder: plans.length
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const url = editingPlan ? `/admin/plans/${editingPlan.id}` : "/admin/plans";
            const method = editingPlan ? "PUT" : "POST";

            const res = await apiFetch(url, {
                method,
                body: JSON.stringify(form)
            });

            if (res.ok) {
                toast.success(editingPlan ? "Plano atualizado!" : "Plano criado!");
                setIsModalOpen(false);
                fetchPlans();
            } else {
                toast.error("Erro ao salvar plano");
            }
        } catch (error) {
            toast.error("Erro de conexão");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir este plano?")) return;

        try {
            const res = await apiFetch(`/admin/plans/${id}`, { method: "DELETE" });
            if (res.ok) {
                toast.success("Plano excluído");
                fetchPlans();
            }
        } catch (error) {
            toast.error("Erro ao excluir");
        }
    };

    return (
        <div className="w-full px-8 py-8 h-full bg-slate-50/30">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                <PageHeader
                    title="Planos & Preços"
                    description="Gerencie os planos de assinatura, valores e benefícios visíveis para os alunos."
                    badge="COMMERCE"
                />
                <Button
                    onClick={() => handleOpenModal()}
                    className="h-12 rounded-xl font-bold px-8 gap-2 shadow-lg shadow-indigo-600/20 bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                    <Plus className="w-4 h-4" />
                    Novo Plano
                </Button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {plans.map((plan) => (
                        <div key={plan.id} className={`bg-white rounded-[2rem] border p-6 shadow-sm transition-all hover:shadow-md ${plan.highlight ? 'border-indigo-200 ring-2 ring-indigo-50' : 'border-slate-100'}`}>
                            <div className="flex justify-between items-start mb-6">
                                <div className={`p-3 rounded-2xl ${plan.highlight ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-400'}`}>
                                    <CreditCard size={24} />
                                </div>
                                <div className="flex gap-1">
                                    <button onClick={() => handleOpenModal(plan)} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors">
                                        <Edit2 size={16} />
                                    </button>
                                    <button onClick={() => plan.id && handleDelete(plan.id)} className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="mb-6">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
                                    {plan.active ? (
                                        <CheckCircle2 size={14} className="text-emerald-500" />
                                    ) : (
                                        <XCircle size={14} className="text-slate-300" />
                                    )}
                                </div>
                                <p className="text-sm text-slate-500 line-clamp-2">{plan.description}</p>
                            </div>

                            <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                                <div>
                                    <span className="text-2xl font-black text-slate-900">R$ {plan.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase ml-1">/ {plan.billingInterval}</span>
                                </div>
                                {plan.highlight && (
                                    <span className="px-3 py-1 bg-indigo-600 text-[10px] font-bold text-white rounded-full uppercase tracking-widest">Destaque</span>
                                )}
                            </div>
                        </div>
                    ))}

                    {plans.length === 0 && (
                        <div className="col-span-full py-20 bg-white rounded-[2rem] border border-dashed border-slate-200 flex flex-col items-center justify-center text-center px-6">
                            <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 mb-4">
                                <CreditCard size={32} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-1">Nenhum plano ainda</h3>
                            <p className="text-sm text-slate-500 max-w-sm">Comece criando seu primeiro plano para que os alunos possam assinar a plataforma.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Modal de Cadastro/Edição */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
                        <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-white sticky top-0">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">{editingPlan ? "Editar Plano" : "Novo Plano"}</h2>
                                <p className="text-xs text-slate-500 font-medium">Configure os detalhes comerciais do plano.</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-100 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-8 space-y-6 overflow-y-auto max-h-[70vh]">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nome do Plano</label>
                                    <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ex: Assinatura Mensal Elite" className="w-full h-12 px-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 transition-all text-sm font-semibold outline-none" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Preço (BRL)</label>
                                    <input required type="number" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: parseFloat(e.target.value) })} placeholder="99.90" className="w-full h-12 px-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 transition-all text-sm font-semibold outline-none" />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Descrição Curta</label>
                                <textarea required value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Descreva os principais benefícios..." className="w-full h-24 p-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 transition-all text-sm font-semibold outline-none resize-none" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Intervalo de Cobrança</label>
                                    <select value={form.billingInterval} onChange={e => setForm({ ...form, billingInterval: e.target.value })} className="w-full h-12 px-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-indigo-600 transition-all text-sm font-semibold outline-none">
                                        <option value="MONTHLY">Mensal</option>
                                        <option value="YEARLY">Anual</option>
                                        <option value="ONE_TIME">Pagamento Único</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Selo (Badge)</label>
                                    <input value={form.badge} onChange={e => setForm({ ...form, badge: e.target.value })} placeholder="Ex: Mais Popular" className="w-full h-12 px-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-indigo-600 transition-all text-sm font-semibold outline-none" />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Benefícios (JSON Array)</label>
                                <textarea value={form.features} onChange={e => setForm({ ...form, features: e.target.value })} placeholder='["Acesso Total", "Simulados Semanais"]' className="w-full h-20 p-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-indigo-600 transition-all text-[13px] font-mono outline-none resize-none" />
                            </div>

                            <div className="flex flex-wrap gap-6 pt-2">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div className="relative flex items-center">
                                        <input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} className="sr-only peer" />
                                        <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-emerald-500 transition-all after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5" />
                                    </div>
                                    <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900 transition-colors">Plano Ativo</span>
                                </label>

                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div className="relative flex items-center">
                                        <input type="checkbox" checked={form.highlight} onChange={e => setForm({ ...form, highlight: e.target.checked })} className="sr-only peer" />
                                        <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-indigo-600 transition-all after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5" />
                                    </div>
                                    <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900 transition-colors">Destaque</span>
                                </label>
                            </div>

                            <div className="flex gap-4 pt-4 sticky bottom-0 bg-white">
                                <Button type="submit" disabled={saving} className="flex-1 h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold gap-2 shadow-xl shadow-indigo-600/20">
                                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save size={18} />}
                                    {editingPlan ? "Atualizar Plano" : "Criar Plano"}
                                </Button>
                                <Button type="button" onClick={() => setIsModalOpen(false)} variant="outline" className="flex-1 h-14 rounded-2xl border-slate-200 text-slate-600 font-bold hover:bg-slate-50">
                                    Cancelar
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
