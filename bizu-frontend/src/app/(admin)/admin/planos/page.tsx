"use client";

import PageHeader from "@/components/PageHeader";
import {
    CreditCard,
    Plus,
    MoreVertical,
    CheckCircle2,
    XCircle,
    Edit2,
    Trash2,
    Users
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function AdminPlanosPage() {
    const plans = [
        {
            id: "1",
            name: "Plano Prata",
            price: "19,90",
            interval: "MENSAL",
            active: true,
            subscribers: 412,
            group: false
        },
        {
            id: "2",
            name: "Plano Diamante",
            price: "497,00",
            interval: "ANUAL",
            active: true,
            subscribers: 289,
            group: false
        },
        {
            id: "3",
            name: "Assinatura Familiar",
            price: "89,90",
            interval: "MENSAL",
            active: true,
            subscribers: 155,
            group: true,
            maxMembers: 5
        },
        {
            id: "4",
            name: "Plano Bronze",
            price: "9,90",
            interval: "MENSAL",
            active: false,
            subscribers: 0,
            group: false
        },
    ];

    return (
        <div className="container mx-auto px-4 py-12 max-w-7xl">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <PageHeader
                    title="Gestão de Planos"
                    description="Controle os produtos, preços e acessos disponíveis no portal Bizu!."
                    badge="PRODUCTS"
                />
                <Button className="h-14 rounded-2xl font-black text-lg gap-2 shadow-xl shadow-primary/20">
                    <Plus className="w-5 h-5" />
                    Novo Plano
                </Button>
            </div>

            <div className="bg-card border rounded-[48px] overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-muted/50 border-b">
                        <tr>
                            <th className="px-8 py-5 text-xs font-black text-muted-foreground uppercase tracking-widest">Produto</th>
                            <th className="px-8 py-5 text-xs font-black text-muted-foreground uppercase tracking-widest">Preço</th>
                            <th className="px-8 py-5 text-xs font-black text-muted-foreground uppercase tracking-widest">Alunos</th>
                            <th className="px-8 py-5 text-xs font-black text-muted-foreground uppercase tracking-widest">Status</th>
                            <th className="px-8 py-5 text-xs font-black text-muted-foreground uppercase tracking-widest text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {plans.map((plan) => (
                            <tr key={plan.id} className="hover:bg-muted/30 transition-colors group">
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${plan.active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                            {plan.group ? <Users className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <div className="font-bold">{plan.name}</div>
                                            <div className="text-xs text-muted-foreground font-medium uppercase tracking-widest">{plan.interval}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6 font-bold">R$ {plan.price}</td>
                                <td className="px-8 py-6 font-black">{plan.subscribers}</td>
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
                                        <Button variant="ghost" size="sm" className="rounded-xl h-10 w-10 p-0 hover:bg-muted">
                                            <Edit2 className="w-4 h-4 text-primary" />
                                        </Button>
                                        <Button variant="ghost" size="sm" className="rounded-xl h-10 w-10 p-0 hover:bg-destructive/10">
                                            <Trash2 className="w-4 h-4 text-destructive" />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-8 p-8 rounded-[40px] bg-muted/30 border border-dashed flex items-center gap-6">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                    <Plus className="w-6 h-6" />
                </div>
                <div>
                    <div className="font-bold">Dica de Gestão</div>
                    <p className="text-sm text-muted-foreground font-medium italic">Considere criar cupons de desconto sazonais para aumentar a taxa de conversão em feriados e datas comemorativas.</p>
                </div>
            </div>
        </div>
    );
}
