"use client";

import { useEffect, useState } from "react";
import {
    Users,
    CreditCard,
    TrendingUp,
    AlertCircle,
    Activity,
    ArrowUpRight,
    UserCheck,
    Zap,
    Loader2,
} from "lucide-react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

interface DashboardStats {
    totalUsers: number;
    newUsersToday: number;
    activeSubscriptions: number;
    monthlyRevenue: number;
    recentActivity: Array<{
        userName: string;
        amount: number;
        status: string;
        createdAt: string;
    }>;
}

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        async function fetchStats() {
            try {
                const response = await apiFetch("/admin/dashboard/stats");
                if (response.ok) {
                    const data = await response.json();
                    setStats(data);
                } else {
                    setError(true);
                }
            } catch (err) {
                console.error("Failed to fetch stats", err);
                setError(true);
            } finally {
                setLoading(false);
            }
        }

        fetchStats();
    }, []);

    const statCards = [
        {
            label: "Total de Alunos",
            value: stats?.totalUsers.toLocaleString('pt-BR') || "0",
            icon: Users,
            color: "from-blue-500 to-indigo-600",
            trend: "+ --",
            delay: 0.1
        },
        {
            label: "Novos Hoje",
            value: stats?.newUsersToday.toLocaleString('pt-BR') || "0",
            icon: Zap,
            color: "from-amber-500 to-orange-500",
            trend: "+ --",
            delay: 0.2
        },
        {
            label: "Assinaturas Ativas",
            value: stats?.activeSubscriptions.toLocaleString('pt-BR') || "0",
            icon: UserCheck,
            color: "from-emerald-500 to-teal-500",
            trend: "+ --",
            delay: 0.3
        },
        {
            label: "Faturamento Mensal",
            value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats?.monthlyRevenue || 0),
            icon: CreditCard,
            color: "from-purple-500 to-pink-600",
            trend: "+ --",
            delay: 0.4
        },
    ];

    if (loading) {
        return (
            <div className="flex h-[70vh] w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 max-w-[1200px]"
        >
            <div className="mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-3">
                    <Zap size={12} />
                    Admin
                </div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
                    Painel Administrativo
                </h1>
                <p className="text-sm text-slate-500">
                    Visao geral do ecossistema Bizu!. Monitore metricas, usuarios e assinaturas em tempo real.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                {statCards.map((stat, idx) => {
                    const Icon = stat.icon;
                    return (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: stat.delay }}
                            className="card-elevated p-5 relative overflow-hidden group"
                        >
                            <div className="absolute -right-2 -top-2 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Icon size={80} />
                            </div>
                            <div className="flex items-center justify-between mb-4 relative z-10">
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-md`}>
                                    <Icon size={18} className="text-white" />
                                </div>
                                <div className="text-[11px] font-bold px-2.5 py-1 bg-slate-50 text-slate-400 rounded-lg">
                                    Total
                                </div>
                            </div>
                            <div className="text-2xl font-extrabold text-slate-900 mb-1 relative z-10">{stat.value}</div>
                            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider relative z-10">{stat.label}</div>
                        </motion.div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Atividade Recente */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="lg:col-span-2 card-elevated !rounded-3xl p-6"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                            <Activity size={18} className="text-indigo-500" />
                            Atividade Recente
                        </h3>
                        <Link href="/admin/vendas" className="text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors">
                            Ver Todos
                        </Link>
                    </div>

                    <div className="space-y-2">
                        {stats?.recentActivity && stats.recentActivity.length > 0 ? (
                            stats.recentActivity.map((activity, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6 + (i * 0.05) }}
                                    className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-sm">
                                            {activity.userName.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-slate-800">{activity.userName}</div>
                                            <div className="text-[11px] text-slate-500">
                                                {activity.status === 'SUCCEEDED' ? 'Pagamento Aprovado' : 'Tentativa de Pagamento'} - {new Date(activity.createdAt).toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`text-sm font-extrabold ${activity.status === 'SUCCEEDED' ? 'text-emerald-600' : 'text-slate-400'}`}>
                                        {activity.status === 'SUCCEEDED' ? '+' : ''} {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(activity.amount)}
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="py-12 text-center">
                                <p className="text-sm text-slate-400">Nenhuma atividade recente encontrada.</p>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Lateral */}
                <div className="space-y-6">
                    {/* Meta */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 }}
                        className="rounded-3xl p-6 relative overflow-hidden bg-gradient-to-br from-indigo-600 to-violet-700 text-white shadow-xl shadow-indigo-500/20"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                        <TrendingUp size={24} className="mb-4 text-indigo-200" />
                        <h3 className="text-lg font-extrabold mb-1">Status da Plataforma</h3>
                        <p className="text-xs text-indigo-200 mb-5 leading-relaxed">
                            O sistema esta operando normalmente. {stats?.totalUsers || 0} alunos cadastrados no total.
                        </p>
                        <div className="w-full h-2 bg-black/20 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                className="h-full bg-emerald-400 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.5)]"
                            />
                        </div>
                        <div className="mt-2 text-[10px] font-bold text-right">Online</div>
                    </motion.div>

                    {/* Alerta */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 }}
                        className="card-elevated !rounded-3xl p-6 border-l-4 border-l-amber-500"
                    >
                        <div className="flex items-center gap-2 text-amber-600 mb-2">
                            <AlertCircle size={16} />
                            <h4 className="font-bold text-[11px] uppercase tracking-widest">Alertas de Sistema</h4>
                        </div>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed mb-4">
                            Tudo parecendo em ordem por aqui. Monitore o webhook do Stripe para atualizações em tempo real.
                        </p>
                        <button className="w-full h-10 rounded-xl bg-amber-50 text-amber-700 hover:bg-amber-100 font-bold text-xs transition-colors">
                            Ver Logs do Sistema
                        </button>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}
