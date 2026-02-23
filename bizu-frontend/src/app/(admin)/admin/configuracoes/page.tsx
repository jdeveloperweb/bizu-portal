"use client";

import PageHeader from "../../../../components/PageHeader";
import {
    Save,
    CreditCard,
    Mail,
    Video,
    Server,
} from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { useState } from "react";

export default function AdminConfiguracoesPage() {
    const [activeTab, setActiveTab] = useState("pagamento");

    const tabs = [
        { id: "pagamento", label: "Gateways de Pagamento", icon: CreditCard },
        { id: "email", label: "Servidor de E-mail (SMTP)", icon: Mail },
        { id: "video", label: "Hospedagem de Vídeos", icon: Video },
        { id: "sistema", label: "Gerais do Sistema", icon: Server },
    ];

    return (
        <div className="container mx-auto px-4 py-12 max-w-5xl">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <PageHeader
                    title="Configurações do Sistema"
                    description="Gerencie chaves de API, integrações e parâmetros gerais da plataforma."
                    badge="SISTEMA"
                />
                <Button className="h-14 rounded-2xl font-black px-12 gap-2 shadow-xl shadow-indigo-600/20 bg-indigo-600 hover:bg-indigo-700 text-white">
                    <Save className="w-5 h-5" />
                    Salvar Configurações
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Menus Laterais */}
                <div className="lg:col-span-1 space-y-2">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-5 py-4 rounded-3xl font-bold transition-all ${isActive
                                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                                        : "bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-900 border border-slate-100"
                                    }`}
                            >
                                <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-slate-400"}`} />
                                <span className="text-sm">{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Conteúdo da Aba */}
                <div className="lg:col-span-3">
                    <div className="p-8 md:p-10 rounded-[48px] bg-white border border-slate-100 shadow-sm min-h-[500px]">

                        {activeTab === "pagamento" && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 mb-2">Gateways de Pagamento</h3>
                                    <p className="text-slate-500 text-sm">Configure as chaves e tokens para processamento de pagamentos.</p>
                                </div>

                                {/* Stripe */}
                                <div className="space-y-6 p-8 rounded-[32px] bg-slate-50 border border-slate-100">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 rounded-xl bg-[#635BFF]/10 flex items-center justify-center text-[#635BFF]">
                                            <CreditCard className="w-5 h-5" />
                                        </div>
                                        <h4 className="text-lg font-bold text-slate-900">Integração Stripe</h4>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Chave Pública (Publishable Key)</label>
                                        <input
                                            type="text"
                                            placeholder="pk_test_..."
                                            className="w-full h-14 px-6 rounded-2xl bg-white border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-mono text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Chave Secreta (Secret Key)</label>
                                        <input
                                            type="password"
                                            placeholder="sk_test_..."
                                            className="w-full h-14 px-6 rounded-2xl bg-white border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-mono text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Webhook Secret</label>
                                        <input
                                            type="password"
                                            placeholder="whsec_..."
                                            className="w-full h-14 px-6 rounded-2xl bg-white border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-mono text-sm"
                                        />
                                    </div>
                                </div>

                                {/* Mercado Pago */}
                                <div className="space-y-6 p-8 rounded-[32px] bg-slate-50 border border-slate-100">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 rounded-xl bg-[#009EE3]/10 flex items-center justify-center text-[#009EE3]">
                                            <CreditCard className="w-5 h-5" />
                                        </div>
                                        <h4 className="text-lg font-bold text-slate-900">Mercado Pago</h4>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Access Token</label>
                                        <input
                                            type="password"
                                            placeholder="APP_USR-..."
                                            className="w-full h-14 px-6 rounded-2xl bg-white border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-mono text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Public Key</label>
                                        <input
                                            type="text"
                                            placeholder="APP_USR-..."
                                            className="w-full h-14 px-6 rounded-2xl bg-white border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-mono text-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "email" && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 mb-2">Servidor de E-mail</h3>
                                    <p className="text-slate-500 text-sm">Configurações de SMTP para envio de e-mails transacionais (Recuperação de senha, boas-vindas, etc).</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8 rounded-[32px] bg-slate-50 border border-slate-100">
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Host SMTP</label>
                                        <input
                                            type="text"
                                            placeholder="smtp.mailgun.org"
                                            className="w-full h-14 px-6 rounded-2xl bg-white border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-mono text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Porta</label>
                                        <input
                                            type="number"
                                            placeholder="587"
                                            className="w-full h-14 px-6 rounded-2xl bg-white border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-mono text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Criptografia</label>
                                        <select className="w-full h-14 px-6 rounded-2xl bg-white border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold text-slate-700">
                                            <option value="tls">TLS</option>
                                            <option value="ssl">SSL</option>
                                            <option value="none">Nenhuma</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Usuário SMTP</label>
                                        <input
                                            type="text"
                                            placeholder="contato@seudominio.com"
                                            className="w-full h-14 px-6 rounded-2xl bg-white border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-mono text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Senha SMTP</label>
                                        <input
                                            type="password"
                                            placeholder="••••••••••••••••"
                                            className="w-full h-14 px-6 rounded-2xl bg-white border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-mono text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2 md:col-span-2 pt-4">
                                        <Button variant="outline" className="w-full h-14 rounded-2xl font-bold border-indigo-200 text-indigo-600 hover:bg-indigo-50">
                                            Testar Conexão SMTP
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "video" && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 mb-2">Hospedagem de Vídeos</h3>
                                    <p className="text-slate-500 text-sm">Configure as chaves da API para os provedores de vídeo dos cursos (Vimeo, YouTube, Panda Video).</p>
                                </div>

                                <div className="space-y-6 p-8 rounded-[32px] bg-slate-50 border border-slate-100">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 rounded-xl bg-[#1AB7EA]/10 flex items-center justify-center text-[#1AB7EA]">
                                            <Video className="w-5 h-5" />
                                        </div>
                                        <h4 className="text-lg font-bold text-slate-900">Vimeo Pro / Business</h4>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Client Identifier</label>
                                        <input
                                            type="text"
                                            placeholder=""
                                            className="w-full h-14 px-6 rounded-2xl bg-white border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-mono text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Client Secrets</label>
                                        <input
                                            type="password"
                                            placeholder=""
                                            className="w-full h-14 px-6 rounded-2xl bg-white border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-mono text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Personal Access Token</label>
                                        <input
                                            type="password"
                                            placeholder=""
                                            className="w-full h-14 px-6 rounded-2xl bg-white border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-mono text-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "sistema" && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 mb-2">Configurações Gerais</h3>
                                    <p className="text-slate-500 text-sm">Ajuste itens críticos do funcionamento como fuso horário, limites e segurança.</p>
                                </div>

                                <div className="space-y-6 p-8 rounded-[32px] bg-slate-50 border border-slate-100">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Fuso Horário Principal (Timezone)</label>
                                        <select className="w-full h-14 px-6 rounded-2xl bg-white border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold text-slate-700">
                                            <option value="America/Sao_Paulo">America/Sao_Paulo (Horário de Brasília)</option>
                                            <option value="UTC">UTC (Universal Time)</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Tempo Expirar Sessão (minutos)</label>
                                        <input
                                            type="number"
                                            defaultValue={120}
                                            className="w-full h-14 px-6 rounded-2xl bg-white border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold text-slate-700"
                                        />
                                    </div>

                                    <div className="pt-6 border-t border-slate-200">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-bold text-slate-900">Modo de Manutenção</h4>
                                                <p className="text-xs text-slate-500 mt-1">Exibe uma tela de manutenção e impede acesso aos painéis públicos.</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" className="sr-only peer" />
                                                <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-500"></div>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
}
