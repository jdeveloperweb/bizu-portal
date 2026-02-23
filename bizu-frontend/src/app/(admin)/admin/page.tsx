"use client";

import {
    Users,
    CreditCard,
    TrendingUp,
    AlertCircle,
    Activity,
    ArrowUpRight,
    UserCheck,
    Zap,
} from "lucide-react";
import Link from "next/link";

export default function AdminDashboardPage() {
    const stats = [
        { label: "Total de Alunos", value: "1.284", icon: Users, color: "from-blue-500 to-indigo-600", trend: "+12%" },
        { label: "Ativos Hoje (DAU)", value: "342", icon: Activity, color: "from-amber-500 to-orange-500", trend: "+24%" },
        { label: "Ativos no Mes (MAU)", value: "956", icon: UserCheck, color: "from-emerald-500 to-teal-500", trend: "+8%" },
        { label: "Faturamento Mensal", value: "R$ 42.800", icon: CreditCard, color: "from-purple-500 to-pink-600", trend: "+15%" },
    ];

    return (
        <div className="p-8 max-w-[1200px]">
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
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div key={stat.label} className="card-elevated p-5">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-sm`}>
                                    <Icon size={18} className="text-white" />
                                </div>
                                <div className="text-[11px] font-bold px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-lg">
                                    {stat.trend}
                                </div>
                            </div>
                            <div className="text-2xl font-extrabold text-slate-900 mb-1">{stat.value}</div>
                            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</div>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Atividade Recente */}
                <div className="lg:col-span-2 card-elevated !rounded-3xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                            <Activity size={18} className="text-indigo-500" />
                            Atividade Recente
                        </h3>
                        <button className="text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors">
                            Ver Todos
                        </button>
                    </div>

                    <div className="space-y-2">
                        {[1, 2, 3, 4].map((n) => (
                            <div key={n} className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-sm">
                                        MS
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-slate-800">Novo Assinante: Maria Silva</div>
                                        <div className="text-[11px] text-slate-500">Plano Anual - Ha 2 horas</div>
                                    </div>
                                </div>
                                <div className="text-sm font-extrabold text-emerald-600">+ R$ 497,00</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Lateral */}
                <div className="space-y-6">
                    {/* Meta */}
                    <div className="rounded-3xl p-6 relative overflow-hidden bg-gradient-to-br from-indigo-600 to-violet-700 text-white shadow-xl shadow-indigo-500/20">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                        <TrendingUp size={24} className="mb-4 text-indigo-200" />
                        <h3 className="text-lg font-extrabold mb-1">Meta de Vendas</h3>
                        <p className="text-xs text-indigo-200 mb-5 leading-relaxed">
                            Voce atingiu 82% da meta total deste mes. Faltam R$ 7.200 para o bonus da equipe.
                        </p>
                        <div className="w-full h-2 bg-black/20 rounded-full overflow-hidden">
                            <div className="w-[82%] h-full bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                        </div>
                        <div className="mt-2 text-[10px] font-bold text-right">82%</div>
                    </div>

                    {/* Alerta */}
                    <div className="card-elevated !rounded-3xl p-6 border-l-4 border-l-amber-500">
                        <div className="flex items-center gap-2 text-amber-600 mb-2">
                            <AlertCircle size={16} />
                            <h4 className="font-bold text-[11px] uppercase tracking-widest">Alertas de Sistema</h4>
                        </div>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed mb-4">
                            Existem 3 transacoes pendentes de confirmacao. Verifique os webhooks para garantir a liberacao dos acessos.
                        </p>
                        <button className="w-full h-10 rounded-xl bg-amber-50 text-amber-700 hover:bg-amber-100 font-bold text-xs transition-colors">
                            Resolver Agora
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
