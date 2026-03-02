"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
    Zap, Brain, Shield, Clock, Target,
    ChevronRight, ShoppingCart, Star, Crown,
    Sparkles, ArrowUpRight, TrendingUp, Info, CreditCard
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface StoreItem {
    id: string;
    code: string;
    name: string;
    description: string;
    price: number;
    icon: any;
    color: string;
    category: "consumable" | "permanent" | "status";
}

export default function AxonStorePage() {
    const { user } = useAuth();
    const [gamification, setGamification] = useState<any>(null);
    const [inventory, setInventory] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isBuying, setIsBuying] = useState<string | null>(null);
    const [isRechargeModalOpen, setIsRechargeModalOpen] = useState(false);
    const [isGeneratingCheckout, setIsGeneratingCheckout] = useState(false);
    const [selectedPackId, setSelectedPackId] = useState("2");

    const AXON_PACKS = [
        { id: "1", code: "AXON_PACK_1000", name: "Iniciante", amount: 1000, price: 9.90, badge: "", icon: Zap, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-400" },
        { id: "2", code: "AXON_PACK_3000", name: "Custo-Benefício", amount: 3000, price: 24.90, badge: "Mais Popular", icon: Star, color: "text-amber-500", bg: "bg-amber-50", border: "border-amber-400" },
        { id: "3", code: "AXON_PACK_10000", name: "Ostentação", amount: 10000, price: 69.90, badge: "Melhor Valor", icon: Crown, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-400" },
    ];

    const storeItems: StoreItem[] = [
        {
            id: "1",
            code: "STREAK_FREEZE",
            name: "Escudo de Ofensiva",
            description: "Protege sua sequência de dias caso você esqueça de estudar por um dia.",
            price: 150,
            icon: Shield,
            color: "from-blue-400 to-indigo-600",
            category: "consumable"
        },
        {
            id: "2",
            code: "DOUBLE_XP_2H",
            name: "Dobra de XP (2h)",
            description: "Todo XP ganho em questões e simulados é dobrado por 2 horas.",
            price: 500,
            icon: Zap,
            color: "from-amber-400 to-orange-600",
            category: "consumable"
        },
        {
            id: "3",
            code: "RADAR_MATERIA_24H",
            name: "Radar de Matéria",
            description: "Aumenta o XP ganho em uma matéria específica durante 24 horas.",
            price: 300,
            icon: Target,
            color: "from-emerald-400 to-teal-600",
            category: "consumable"
        },
        {
            id: "4",
            code: "STATUS_ELITE",
            name: "Título: Elite",
            description: "Desbloqueia o título 'Elite' para aparecer no seu perfil e ranking.",
            price: 2000,
            icon: Crown,
            color: "from-purple-500 to-fuchsia-600",
            category: "status"
        }
    ];

    const fetchStoreData = async () => {
        setIsLoading(true);
        try {
            const [gamRes, invRes] = await Promise.all([
                apiFetch("/student/gamification/me"),
                apiFetch("/student/store/inventory")
            ]);

            if (gamRes.ok) setGamification(await gamRes.json());
            if (invRes.ok) setInventory(await invRes.json());
        } catch (error) {
            console.error("Store fetch error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStoreData();
    }, []);

    const handleBuy = async (item: StoreItem) => {
        if (!gamification || gamification.axons < item.price) {
            toast.error("Axons insuficientes! Estude mais para ganhar.");
            return;
        }

        setIsBuying(item.id);
        try {
            const res = await apiFetch("/student/store/buy", {
                method: "POST",
                body: JSON.stringify({ itemCode: item.code, price: item.price })
            });

            if (res.ok) {
                toast.success(`${item.name} adquirido com sucesso!`);
                fetchStoreData(); // Refresh axons and inventory
            } else {
                toast.error(await res.text());
            }
        } catch (error) {
            toast.error("Erro na transação");
        } finally {
            setIsBuying(null);
        }
    };

    const handleUseItem = async (item: StoreItem) => {
        try {
            const res = await apiFetch("/student/store/use", {
                method: "POST",
                body: JSON.stringify({ itemCode: item.code })
            });

            if (res.ok) {
                toast.success(`${item.name} ativado com sucesso! Aproveite o buff.`);
                fetchStoreData();
                // Forçar recarregamento da aura e stats
                window.dispatchEvent(new Event("buff-activated"));
            } else {
                toast.error(await res.text());
            }
        } catch (error) {
            toast.error("Erro ao ativar item");
        }
    };

    const handleBuyAxonPack = async (packCode: string) => {
        setIsGeneratingCheckout(true);
        try {
            const res = await apiFetch("/student/store/checkout", {
                method: "POST",
                body: JSON.stringify({ packCode })
            });

            if (!res.ok) throw new Error(await res.text());

            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                throw new Error("URL de checkout não gerada");
            }
        } catch (error: any) {
            toast.error(error.message || "Erro ao iniciar compra");
            setIsGeneratingCheckout(false);
        }
    };

    const axons = gamification?.axons || 0;

    return (
        <div className="p-6 md:p-10 max-w-[1400px] mx-auto min-h-screen">
            {/* Header / Wallet */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <ShoppingCart className="text-indigo-600" /> Axon Store
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">Invista seus Axons em capacidades e status.</p>
                </div>

                <div className="flex items-center gap-4 bg-white p-3 md:p-4 rounded-[32px] shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3 px-6 py-2 border-r border-slate-100">
                        <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center text-white shadow-lg shadow-violet-200">
                            <Brain size={20} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-2xl font-black text-slate-900 tabular-nums leading-none">
                                {isLoading ? <Skeleton className="h-6 w-12" /> : axons}
                            </span>
                            <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">Meus Axons</span>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsRechargeModalOpen(true)}
                        className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl text-xs font-black hover:bg-slate-800 transition-all hover:scale-105"
                    >
                        <CreditCard size={14} /> Recarregar
                    </button>
                </div>
            </div>

            {/* Featured Banner */}
            <div className="relative rounded-[40px] overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 p-10 md:p-16 mb-16 shadow-2xl">
                <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_rgba(99,102,241,0.2),_transparent_60%)]" />
                <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-6 bg-indigo-500/10 px-4 py-1.5 rounded-full border border-indigo-500/20">
                            <Sparkles size={14} /> Destaque da Semana
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
                            Domine o Ranking com <span className="text-indigo-400 underline decoration-indigo-400/40">Dobra de XP</span>
                        </h2>
                        <p className="text-slate-400 text-lg mb-10 leading-relaxed font-medium">
                            Acelere sua subida de patente. Durante o evento de final de semana, o bônus de XP do item é acumulativo com as missões diárias!
                        </p>
                        <button
                            onClick={() => handleBuy(storeItems[1])}
                            disabled={isBuying === "2"}
                            className="bg-white text-slate-950 px-10 py-5 rounded-2xl font-black flex items-center gap-3 hover:scale-105 transition-all shadow-xl hover:bg-indigo-50 disabled:opacity-50"
                        >
                            {isBuying === "2" ? "Negociando..." : <>Adquirir por 500 Axons <ArrowUpRight size={18} /></>}
                        </button>
                    </div>
                    <div className="hidden md:flex justify-center">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                            className="relative w-72 h-72"
                        >
                            <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" />
                            <Zap className="w-full h-full text-indigo-500/30" />
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Store Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                {storeItems.map((item) => {
                    const invQuantity = inventory.find(i => i.itemCode === item.code)?.quantity || 0;
                    return (
                        <motion.div
                            key={item.id}
                            whileHover={{ y: -5 }}
                            className="bg-white border border-slate-200 rounded-[32px] p-6 flex flex-col items-center text-center shadow-sm hover:shadow-xl transition-all h-full"
                        >
                            <div className={`w-16 h-16 rounded-[24px] bg-gradient-to-br ${item.color} flex items-center justify-center text-white mb-6 shadow-lg shadow-indigo-100`}>
                                <item.icon size={32} />
                            </div>

                            <div className="flex-1">
                                <h3 className="text-lg font-black text-slate-900 mb-2">{item.name}</h3>
                                <p className="text-xs text-slate-500 font-medium leading-relaxed mb-6">
                                    {item.description}
                                </p>
                            </div>

                            {invQuantity > 0 && (
                                <motion.div
                                    animate={{
                                        boxShadow: ["0px 0px 0px rgba(99,102,241,0)", "0px 0px 15px rgba(99,102,241,0.4)", "0px 0px 0px rgba(99,102,241,0)"]
                                    }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-4 py-1.5 rounded-full mb-4 flex items-center gap-2"
                                >
                                    <Sparkles size={10} /> Você possui: {invQuantity}
                                </motion.div>
                            )}

                            {invQuantity > 0 ? (
                                <button
                                    onClick={() => handleUseItem(item)}
                                    className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
                                >
                                    <Zap size={14} className="animate-pulse" />
                                    Ativar Agora
                                </button>
                            ) : (
                                <button
                                    onClick={() => handleBuy(item)}
                                    disabled={isBuying === item.id}
                                    className="w-full py-4 bg-slate-50 border border-slate-200 text-slate-900 font-bold rounded-2xl hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                                >
                                    <Brain size={14} className="group-hover:animate-bounce" />
                                    {isBuying === item.id ? "Comprando..." : `${item.price} Axons`}
                                </button>
                            )}
                        </motion.div>
                    );
                })}
            </div>

            {/* Info / FAQ Section */}
            <div className="bg-slate-50 rounded-[40px] p-10 md:p-12 border border-slate-200">
                <div className="flex items-center gap-3 mb-8">
                    <Info className="text-indigo-600" />
                    <h3 className="text-xl font-bold text-slate-800">Sobre os Itens</h3>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="space-y-3">
                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-indigo-600 shadow-sm">
                            <Shield size={16} />
                        </div>
                        <p className="text-sm font-bold text-slate-700">Como funciona o Escudo?</p>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium">O escudo é consumido automaticamente no primeiro dia que você não registrar atividade. Ele mantém seu contador de dias intacto.</p>
                    </div>
                    <div className="space-y-3">
                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-amber-600 shadow-sm">
                            <TrendingUp size={16} />
                        </div>
                        <p className="text-sm font-bold text-slate-700">Dobra de XP Acumula?</p>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium">Não. Se você já tem um bônus ativo, o tempo será somado à duração atual. O multiplicador máximo é sempre 2x.</p>
                    </div>
                    <div className="space-y-3">
                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-purple-600 shadow-sm">
                            <Crown size={16} />
                        </div>
                        <p className="text-sm font-bold text-slate-700">Posso transferir itens?</p>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium">Não. No momento os itens são vinculados à sua rede neural (conta) e não podem ser transferidos para outros estudantes.</p>
                    </div>
                </div>
            </div>
            {/* Modal de Recarga */}
            <AnimatePresence>
                {isRechargeModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => !isGeneratingCheckout && setIsRechargeModalOpen(false)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-3xl bg-white rounded-[32px] shadow-2xl overflow-hidden border border-slate-200 p-6 md:p-10 flex flex-col items-center text-center max-h-[90vh] overflow-y-auto custom-scrollbar"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-6 shadow-sm">
                                <CreditCard size={32} />
                            </div>

                            <h3 className="text-3xl font-black text-slate-900 mb-2">Recarregar Axons</h3>
                            <p className="text-sm font-medium text-slate-500 mb-8 leading-relaxed max-w-md">
                                Escolha o pacote de Axons que mais combina com seu objetivo. Invista na sua evolução e conquiste mais do que os adversários.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full mb-10">
                                {AXON_PACKS.map(pack => (
                                    <div
                                        key={pack.id}
                                        onClick={() => setSelectedPackId(pack.id)}
                                        className={`relative cursor-pointer rounded-2xl border-2 p-6 flex flex-col items-center text-center transition-all ${selectedPackId === pack.id
                                                ? `${pack.border} bg-white shadow-2xl scale-105 z-10 ring-4 ring-indigo-50/50`
                                                : "border-slate-100 bg-slate-50 hover:bg-white hover:border-slate-300 opacity-90 hover:opacity-100"
                                            }`}
                                    >
                                        {pack.badge && (
                                            <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-white whitespace-nowrap ${pack.id === "2" ? "bg-amber-500 shadow-md shadow-amber-200" : "bg-purple-600 shadow-md shadow-purple-200"
                                                }`}>
                                                {pack.badge}
                                            </div>
                                        )}

                                        <div className={`w-14 h-14 rounded-full mb-4 flex items-center justify-center ${pack.bg} ${pack.color}`}>
                                            <pack.icon size={28} />
                                        </div>

                                        <h4 className="text-sm font-bold text-slate-700 mb-1">{pack.name}</h4>
                                        <div className="text-3xl font-black text-slate-900 mb-2">{pack.amount.toLocaleString('pt-BR')} <span className="text-[10px] text-slate-500 font-medium">Axons</span></div>
                                        <div className={`text-sm font-black w-full py-2.5 rounded-xl mt-auto ${selectedPackId === pack.id ? pack.bg + " " + pack.color : "bg-slate-200 text-slate-600"
                                            }`}>
                                            R$ {pack.price.toFixed(2).replace(".", ",")}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-lg">
                                <button
                                    onClick={() => handleBuyAxonPack(AXON_PACKS.find(p => p.id === selectedPackId)?.code || "AXON_PACK_1000")}
                                    disabled={isGeneratingCheckout}
                                    className="flex-1 py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 disabled:opacity-50"
                                >
                                    {isGeneratingCheckout ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Gerando Checkout...
                                        </>
                                    ) : (
                                        <>
                                            <Zap size={18} />
                                            Prosseguir para Pagamento
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={() => setIsRechargeModalOpen(false)}
                                    disabled={isGeneratingCheckout}
                                    className="px-8 py-4 bg-slate-50 text-slate-900 font-bold rounded-2xl hover:bg-slate-100 transition-all border border-slate-200 disabled:opacity-50"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
