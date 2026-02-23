"use client";

import PageHeader from "../../../../components/PageHeader";
import {
    Ticket,
    Plus,
    Calendar,
    Users,
    Trash2,
    CheckCircle2,
    AlertCircle,
    Hash
} from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { useState } from "react";

export default function AdminCuponsPage() {
    const [coupons, setCoupons] = useState([
        { id: "1", code: "BIZU50", type: "PERCENTAGE", value: "50", used: 125, max: 200, expires: "20/03/2026", active: true },
        { id: "2", code: "PROME100", type: "FIXED", value: "100,00", used: 45, max: 50, expires: "01/03/2026", active: true },
        { id: "3", code: "VERAO2026", type: "PERCENTAGE", value: "20", used: 12, max: 1000, expires: "15/04/2026", active: false },
    ]);

    return (
        <div className="container mx-auto px-4 py-12 max-w-7xl">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <PageHeader
                    title="Gestão de Cupons"
                    description="Crie e gerencie códigos de desconto para campanhas de marketing."
                    badge="MARKETING"
                />
                <Button className="h-14 rounded-2xl font-black text-lg gap-2 shadow-xl shadow-primary/20">
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
                                            style={{ width: `${(coupon.used / coupon.max) * 100}%` }}
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
                                    <Button variant="ghost" size="sm" className="rounded-xl hover:bg-destructive/10 text-destructive opacity-0 group-hover:opacity-100 transition-all">
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
        </div>
    );
}
