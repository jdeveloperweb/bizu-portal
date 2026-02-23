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
    Save
} from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { useState } from "react";

export default function AdminCuponsPage() {
    const [coupons, setCoupons] = useState([
        { id: "1", code: "BIZU50", type: "PERCENTAGE", value: "50", used: 125, max: 200, expires: "20/03/2026", active: true },
        { id: "2", code: "PROME100", type: "FIXED", value: "100,00", used: 45, max: 50, expires: "01/03/2026", active: true },
        { id: "3", code: "VERAO2026", type: "PERCENTAGE", value: "20", used: 12, max: 1000, expires: "15/04/2026", active: false },
    ]);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newCoupon, setNewCoupon] = useState({ code: "", type: "PERCENTAGE", value: "", max: "", expires: "" });

    const handleDelete = (id: string) => {
        setCoupons(prev => prev.filter(c => c.id !== id));
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        const created = {
            id: Date.now().toString(),
            code: newCoupon.code.toUpperCase(),
            type: newCoupon.type,
            value: newCoupon.value,
            used: 0,
            max: parseInt(newCoupon.max) || 0,
            expires: newCoupon.expires ? newCoupon.expires.split('-').reverse().join('/') : "Sem Data",
            active: true
        };
        setCoupons(prev => [created, ...prev]);
        setIsCreateModalOpen(false);
        setNewCoupon({ code: "", type: "PERCENTAGE", value: "", max: "", expires: "" });
    };

    return (
        <div className="container mx-auto px-4 py-12 max-w-7xl relative">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <PageHeader
                    title="Gestão de Cupons"
                    description="Crie e gerencie códigos de desconto para campanhas de marketing."
                    badge="MARKETING"
                />
                <Button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="h-14 rounded-2xl font-black text-lg gap-2 shadow-xl shadow-primary/20"
                >
                    <Plus className="w-5 h-5" />
                    Novo Cupom
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <div className="bg-card border rounded-[40px] p-8 flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                        <Ticket className="w-8 h-8" />
                    </div>
                    <div className="text-3xl font-black">182</div>
                    <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Cupons Utilizados</div>
                </div>
                <div className="bg-card border rounded-[40px] p-8 flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-2xl bg-success/10 flex items-center justify-center text-success mb-4">
                        <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <div className="text-3xl font-black">R$ 12.450</div>
                    <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total Descontado</div>
                </div>
                <div className="bg-card border rounded-[40px] p-8 flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600 mb-4">
                        <Users className="w-8 h-8" />
                    </div>
                    <div className="text-3xl font-black">8.4%</div>
                    <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Taxa de Conversão</div>
                </div>
            </div>

            <div className="bg-card border rounded-[48px] overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-muted/50 border-b">
                        <tr>
                            <th className="px-8 py-5 text-xs font-black text-muted-foreground uppercase tracking-widest">Código</th>
                            <th className="px-8 py-5 text-xs font-black text-muted-foreground uppercase tracking-widest">Desconto</th>
                            <th className="px-8 py-5 text-xs font-black text-muted-foreground uppercase tracking-widest">Uso</th>
                            <th className="px-8 py-5 text-xs font-black text-muted-foreground uppercase tracking-widest">Expiração</th>
                            <th className="px-8 py-5 text-xs font-black text-muted-foreground uppercase tracking-widest text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {coupons.map((coupon) => (
                            <tr key={coupon.id} className="hover:bg-muted/30 transition-colors group">
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-muted rounded-lg">
                                            <Hash className="w-4 h-4 text-primary" />
                                        </div>
                                        <span className="font-black text-lg">{coupon.code}</span>
                                        {!coupon.active && (
                                            <span className="text-[8px] font-black bg-muted text-muted-foreground px-2 py-0.5 rounded-full">INATIVO</span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="font-bold">
                                        {coupon.type === 'PERCENTAGE' ? `${coupon.value}%` : `R$ ${coupon.value}`}
                                    </div>
                                    <div className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">
                                        {coupon.type === 'PERCENTAGE' ? 'PERCENTUAL' : 'VALOR FIXO'}
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="w-full max-w-[120px] h-2 bg-muted rounded-full overflow-hidden mb-2">
                                        <div
                                            className="h-full bg-primary"
                                            style={{ width: `${(coupon.used / (coupon.max || 1)) * 100}%` }}
                                        />
                                    </div>
                                    <div className="text-xs font-bold text-muted-foreground">
                                        {coupon.used} / {coupon.max} usos
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                                        <Calendar className="w-4 h-4" />
                                        {coupon.expires}
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <Button
                                        onClick={() => handleDelete(coupon.id)}
                                        variant="ghost"
                                        size="sm"
                                        className="rounded-xl hover:bg-destructive/10 text-destructive opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-8 p-10 rounded-[48px] bg-primary text-primary-foreground relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                    <div className="max-w-xl">
                        <h3 className="text-2xl font-black mb-2">Gerador Dinâmico de Cupons</h3>
                        <p className="opacity-80 font-medium italic">Você pode integrar esta funcionalidade para gerar um cupom único de 24h toda vez que um aluno atingir um "Streak" de 30 dias!</p>
                    </div>
                    <Button variant="secondary" className="h-14 rounded-2xl font-black px-12 text-lg">Configurar Automação</Button>
                </div>
            </div>

            {/* Create Coupon Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-card w-full max-w-lg rounded-[40px] p-8 shadow-2xl relative border animate-in zoom-in-95 duration-200">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-6 right-6 rounded-full hover:bg-muted"
                            onClick={() => setIsCreateModalOpen(false)}
                        >
                            <X className="w-5 h-5" />
                        </Button>
                        <div className="mb-8">
                            <h2 className="text-2xl font-black flex items-center gap-3">
                                <span className="p-2 bg-primary/10 text-primary rounded-xl">
                                    <Ticket className="w-6 h-6" />
                                </span>
                                Novo Cupom
                            </h2>
                            <p className="text-muted-foreground mt-2 text-sm">Configure as regras de uso e duração do seu novo cupom de desconto.</p>
                        </div>

                        <form onSubmit={handleCreate} className="space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2 block">Código do Cupom</label>
                                    <div className="relative">
                                        <Hash className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                        <input
                                            required
                                            type="text"
                                            value={newCoupon.code}
                                            onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value })}
                                            className="w-full h-14 pl-12 pr-4 bg-muted/50 border-none rounded-2xl font-bold uppercase text-lg focus:ring-2 focus:ring-primary outline-none"
                                            placeholder="EX: BIZU2025"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2 block">Tipo de Desconto</label>
                                        <select
                                            value={newCoupon.type}
                                            onChange={(e) => setNewCoupon({ ...newCoupon, type: e.target.value })}
                                            className="w-full h-14 px-4 bg-muted/50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-primary appearance-none outline-none"
                                        >
                                            <option value="PERCENTAGE">Percentual (%)</option>
                                            <option value="FIXED">Valor Fixo (R$)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2 block">Valor</label>
                                        <input
                                            required
                                            type="number"
                                            value={newCoupon.value}
                                            onChange={(e) => setNewCoupon({ ...newCoupon, value: e.target.value })}
                                            className="w-full h-14 px-4 bg-muted/50 border-none rounded-2xl font-bold text-lg focus:ring-2 focus:ring-primary outline-none"
                                            placeholder={newCoupon.type === "PERCENTAGE" ? "Ex: 50" : "Ex: 100"}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2 block">Limite de Usos</label>
                                        <input
                                            required
                                            type="number"
                                            value={newCoupon.max}
                                            onChange={(e) => setNewCoupon({ ...newCoupon, max: e.target.value })}
                                            className="w-full h-14 px-4 bg-muted/50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-primary outline-none"
                                            placeholder="Ex: 100"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2 block">Expiração</label>
                                        <input
                                            required
                                            type="date"
                                            value={newCoupon.expires}
                                            onChange={(e) => setNewCoupon({ ...newCoupon, expires: e.target.value })}
                                            className="w-full h-14 px-4 bg-muted/50 border-none rounded-2xl font-bold text-muted-foreground focus:ring-2 focus:ring-primary outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                            <Button type="submit" className="w-full h-14 rounded-2xl font-black text-lg gap-2">
                                <Save className="w-5 h-5" />
                                Criar Cupom
                            </Button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

