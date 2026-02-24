"use client";

import PageHeader from "../../../../components/PageHeader";
import {
    Ticket,
    Plus,
    Calendar,
    Users,
    Trash2,
    CheckCircle2,
    Hash,
    X,
    Save,
    Loader2
} from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { format } from "date-fns";

interface Coupon {
    id: string;
    code: string;
    type: "PERCENTAGE" | "FIXED_AMOUNT";
    value: number;
    usedCount: number;
    maxUses: number | null;
    validUntil: string | null;
    active: boolean;
}

export default function AdminCuponsPage() {
    const { data: session } = useSession();
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [newCoupon, setNewCoupon] = useState({ code: "", type: "PERCENTAGE", value: "", maxUses: "", validUntil: "" });

    const fetchCoupons = async () => {
        if (!session?.accessToken) return;
        setLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/v1/coupons`, {
                headers: {
                    Authorization: `Bearer ${session.accessToken}`
                }
            });
            if (res.ok) {
                const data = await res.json();
                setCoupons(data);
            }
        } catch (error) {
            console.error("Erro ao buscar cupons:", error);
            toast.error("Erro ao carregar cupons.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (session?.accessToken) {
            fetchCoupons();
        }
    }, [session]);

    const handleDelete = async (id: string) => {
        if (!session?.accessToken || !confirm("Tem certeza que deseja excluir este cupom?")) return;
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/v1/coupons/${id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${session.accessToken}`
                }
            });
            if (res.ok) {
                toast.success("Cupom excluído.");
                setCoupons(prev => prev.filter(c => c.id !== id));
            } else {
                toast.error("Erro ao excluir cupom.");
            }
        } catch (error) {
            toast.error("Erro de conexão.");
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!session?.accessToken) return;
        setSubmitting(true);
        try {
            const body = {
                code: newCoupon.code.toUpperCase(),
                type: newCoupon.type,
                value: parseFloat(newCoupon.value),
                maxUses: newCoupon.maxUses ? parseInt(newCoupon.maxUses) : null,
                validUntil: newCoupon.validUntil ? new Date(newCoupon.validUntil).toISOString() : null,
                active: true
            };
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/v1/coupons`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session.accessToken}`
                },
                body: JSON.stringify(body)
            });
            if (res.ok) {
                const created = await res.json();
                toast.success("Cupom criado com sucesso!");
                setCoupons(prev => [created, ...prev]);
                setIsCreateModalOpen(false);
                setNewCoupon({ code: "", type: "PERCENTAGE", value: "", maxUses: "", validUntil: "" });
            } else {
                toast.error("Erro ao criar cupom. Verifique os dados.");
            }
        } catch (error) {
            toast.error("Erro de conexão.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl relative">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                <PageHeader
                    title="Gestão de Cupons"
                    description="Crie e gerencie códigos de desconto para campanhas de marketing."
                    badge="MARKETING"
                />
                <Button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="h-12 rounded-xl font-bold text-base gap-2 shadow-lg shadow-primary/20"
                >
                    <Plus className="w-5 h-5" />
                    Novo Cupom
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-card border border-border rounded-2xl p-6 flex items-center gap-6 shadow-sm">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <Ticket className="w-7 h-7" />
                    </div>
                    <div>
                        <div className="text-2xl font-black">{coupons.reduce((acc, c) => acc + c.usedCount, 0)}</div>
                        <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Cupons Usados</div>
                    </div>
                </div>
                <div className="bg-card border border-border rounded-2xl p-6 flex items-center gap-6 shadow-sm">
                    <div className="w-14 h-14 rounded-xl bg-success/10 flex items-center justify-center text-success shrink-0">
                        <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <div>
                        <div className="text-2xl font-black">{coupons.filter(c => c.active).length}</div>
                        <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Cupons Ativos</div>
                    </div>
                </div>
                <div className="bg-card border border-border rounded-2xl p-6 flex items-center gap-6 shadow-sm">
                    <div className="w-14 h-14 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 shrink-0">
                        <Users className="w-7 h-7" />
                    </div>
                    <div>
                        <div className="text-2xl font-black">{coupons.length}</div>
                        <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Gerados</div>
                    </div>
                </div>
            </div>

            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left whitespace-nowrap">
                        <thead className="bg-muted/30 border-b border-border">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Código</th>
                                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Desconto</th>
                                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Uso</th>
                                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Expiração</th>
                                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                                        Carregando cupons...
                                    </td>
                                </tr>
                            ) : coupons.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground font-medium">
                                        Nenhum cupom encontrado.
                                    </td>
                                </tr>
                            ) : (
                                coupons.map((coupon) => (
                                    <tr key={coupon.id} className="hover:bg-muted/20 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-muted/50 rounded-lg">
                                                    <Hash className="w-4 h-4 text-primary" />
                                                </div>
                                                <span className="font-bold text-base">{coupon.code}</span>
                                                {!coupon.active && (
                                                    <span className="text-[10px] font-bold bg-muted text-muted-foreground px-2 py-0.5 rounded-full">INATIVO</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-sm">
                                                {coupon.type === 'PERCENTAGE' ? `${coupon.value}%` : `R$ ${coupon.value.toFixed(2)}`}
                                            </div>
                                            <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mt-0.5">
                                                {coupon.type === 'PERCENTAGE' ? 'PERCENTUAL' : 'VALOR FIXO'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="w-full max-w-[120px] h-1.5 bg-muted rounded-full overflow-hidden mb-1.5">
                                                <div
                                                    className="h-full bg-primary rounded-full transition-all"
                                                    style={{ width: `${(coupon.usedCount / (coupon.maxUses || Math.max(1, coupon.usedCount))) * 100}%` }}
                                                />
                                            </div>
                                            <div className="text-xs font-medium text-muted-foreground">
                                                {coupon.usedCount} / {coupon.maxUses || '∞'} usos
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                                                <Calendar className="w-4 h-4" />
                                                {coupon.validUntil ? format(new Date(coupon.validUntil), "dd/MM/yyyy") : "Sem expiração"}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Button
                                                onClick={() => handleDelete(coupon.id)}
                                                variant="ghost"
                                                size="sm"
                                                className="rounded-lg hover:bg-destructive/10 text-destructive opacity-0 group-hover:opacity-100 transition-all h-8 w-8 p-0"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Coupon Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-card w-full max-w-lg rounded-2xl p-6 shadow-xl relative border border-border animate-in zoom-in-95 duration-200">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-4 right-4 rounded-xl hover:bg-muted"
                            onClick={() => setIsCreateModalOpen(false)}
                        >
                            <X className="w-5 h-5" />
                        </Button>
                        <div className="mb-6">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Ticket className="w-5 h-5 text-primary" />
                                Novo Cupom
                            </h2>
                            <p className="text-muted-foreground mt-1 text-sm">Configure as regras de uso e duração do seu desconto.</p>
                        </div>

                        <form onSubmit={handleCreate} className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">Código do Cupom</label>
                                <div className="relative">
                                    <Hash className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                    <input
                                        required
                                        type="text"
                                        value={newCoupon.code}
                                        onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value })}
                                        className="w-full h-11 pl-9 pr-3 bg-background border border-border rounded-xl font-semibold uppercase text-sm focus:ring-2 focus:ring-primary/20 appearance-none outline-none transition-all placeholder:normal-case placeholder:font-normal"
                                        placeholder="Ex: BIZU2025"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">Tipo de Desconto</label>
                                    <select
                                        value={newCoupon.type}
                                        onChange={(e) => setNewCoupon({ ...newCoupon, type: e.target.value as any })}
                                        className="w-full h-11 px-3 bg-background border border-border rounded-xl font-medium text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    >
                                        <option value="PERCENTAGE">Percentual (%)</option>
                                        <option value="FIXED_AMOUNT">Valor Fixo (R$)</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">Valor</label>
                                    <input
                                        required
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={newCoupon.value}
                                        onChange={(e) => setNewCoupon({ ...newCoupon, value: e.target.value })}
                                        className="w-full h-11 px-3 bg-background border border-border rounded-xl font-medium text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                        placeholder={newCoupon.type === "PERCENTAGE" ? "Ex: 50" : "Ex: 100"}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">Limite de Usos (Opcional)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={newCoupon.maxUses}
                                        onChange={(e) => setNewCoupon({ ...newCoupon, maxUses: e.target.value })}
                                        className="w-full h-11 px-3 bg-background border border-border rounded-xl font-medium text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                        placeholder="Ex: 100"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">Expiração (Opcional)</label>
                                    <input
                                        type="date"
                                        value={newCoupon.validUntil}
                                        onChange={(e) => setNewCoupon({ ...newCoupon, validUntil: e.target.value })}
                                        className="w-full h-11 px-3 bg-background border border-border rounded-xl font-medium text-sm text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="pt-2">
                                <Button disabled={submitting} type="submit" className="w-full h-11 rounded-xl font-bold gap-2">
                                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    {submitting ? 'Criando...' : 'Criar Cupom'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
