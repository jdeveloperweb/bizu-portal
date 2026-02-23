import PageHeader from "@/components/PageHeader";
import { Users, DollarSign, BookOpen, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function AdminDashboardPage() {
    const stats = [
        { label: "Total de Alunos", value: "2,540", trend: "+12.5%", icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
        { label: "Receita (MRR)", value: "R$ 45.200", trend: "+8.2%", icon: DollarSign, color: "text-green-500", bg: "bg-green-50" },
        { label: "Cursos Ativos", value: "18", trend: "0%", icon: BookOpen, color: "text-purple-500", bg: "bg-purple-50" },
        { label: "Taxa de Churn", value: "2.4%", trend: "-1.1%", icon: TrendingUp, color: "text-red-500", bg: "bg-red-50", inverseTrend: true },
    ];

    return (
        <div className="container mx-auto px-4 py-12">
            <PageHeader
                title="Visão Geral"
                description="Acompanhe o crescimento e a saúde financeira do Bizu! Portal."
                badge="ADMINISTRAÇÃO"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {stats.map((stat) => (
                    <div key={stat.label} className="p-6 rounded-[32px] bg-card border hover:shadow-xl transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <div className={`flex items-center gap-1 text-xs font-bold ${stat.inverseTrend
                                ? (stat.trend.startsWith("-") ? "text-success" : "text-danger")
                                : (stat.trend.startsWith("+") ? "text-success" : "text-danger")
                                }`}>
                                {stat.trend.startsWith("+") ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                {stat.trend}
                            </div>
                        </div>
                        <div className="text-3xl font-black mb-1">{stat.value}</div>
                        <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="p-8 rounded-[40px] bg-card border">
                    <h3 className="text-xl font-black mb-8">Novas Assinaturas</h3>
                    <div className="space-y-6">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                                        U{i}
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold">Usuário Recém Inscrito</div>
                                        <div className="text-xs text-muted-foreground">há {i * 10} minutos • Plano Anual</div>
                                    </div>
                                </div>
                                <div className="text-sm font-black text-success">+ R$ 479,00</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-8 rounded-[40px] bg-card border">
                    <h3 className="text-xl font-black mb-8">Cursos Mais Populares</h3>
                    <div className="space-y-6">
                        {[
                            { name: "Magistratura Federal", users: 1250, value: 65 },
                            { name: "Delegado de Polícia", users: 840, value: 48 },
                            { name: "Analista Judiciário", users: 620, value: 32 },
                        ].map((course) => (
                            <div key={course.name}>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-bold">{course.name}</span>
                                    <span className="text-xs text-muted-foreground">{course.users} alunos</span>
                                </div>
                                <div className="h-2 bg-muted rounded-full overflow-hidden">
                                    <div className="h-full bg-primary rounded-full" style={{ width: `${course.value}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
