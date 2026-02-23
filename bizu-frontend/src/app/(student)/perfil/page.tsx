"use client";

import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Smartphone, Monitor, Shield, LogOut, CreditCard, User as UserIcon } from "lucide-react";
import { useState } from "react";

export default function ProfilePage() {
    const [devices, setDevices] = useState([
        { id: "1", name: "iPhone 15 Pro", os: "iOS", browser: "App", lastIp: "187.12.33.1", lastSeen: "Agora" },
        { id: "2", name: "MacBook Air", os: "macOS", browser: "Chrome", lastIp: "187.12.33.1", lastSeen: "há 2 horas" },
    ]);

    const removeDevice = (id: string) => {
        setDevices(devices.filter(d => d.id !== id));
    };

    return (
        <div className="container mx-auto px-4 py-12 max-w-5xl">
            <PageHeader
                title="Minha Conta"
                description="Gerencie seus dados pessoais, assinaturas e dispositivos conectados."
                badge="CONFIGURAÇÕES"
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Sidebar Nav */}
                <div className="lg:col-span-1 space-y-2">
                    {[
                        { label: "Dados Pessoais", icon: UserIcon, active: true },
                        { label: "Assinatura", icon: CreditCard },
                        { label: "Segurança & Sessões", icon: Shield },
                    ].map((item) => (
                        <div key={item.label} className={`flex items-center gap-3 p-4 rounded-2xl font-bold cursor-pointer transition-all ${item.active ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "hover:bg-muted"
                            }`}>
                            <item.icon className="w-5 h-5" />
                            {item.label}
                        </div>
                    ))}

                    <button className="flex items-center gap-3 p-4 rounded-2xl font-bold text-danger hover:bg-danger/10 w-full transition-all mt-4">
                        <LogOut className="w-5 h-5" />
                        Sair da Conta
                    </button>
                </div>

                {/* Content Area */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Section: Personal Info */}
                    <div className="p-8 rounded-[40px] bg-card border">
                        <h3 className="text-xl font-black mb-6">Dados Pessoais</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-muted-foreground ml-1">Nome Completo</label>
                                <Input defaultValue="Jaime Vicente" className="h-12 rounded-2xl bg-muted/30 border-none" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-muted-foreground ml-1">E-mail</label>
                                <Input defaultValue="jaime@jdeveloper.com.br" disabled className="h-12 rounded-2xl bg-muted/10 border-none cursor-not-allowed" />
                            </div>
                        </div>
                        <Button className="mt-8 rounded-2xl px-8 h-12 font-bold">Salvar Alterações</Button>
                    </div>

                    {/* Section: Subscription */}
                    <div className="p-8 rounded-[40px] bg-card border">
                        <h3 className="text-xl font-black mb-6">Assinatura Ativa</h3>
                        <div className="flex items-center justify-between p-6 rounded-3xl bg-primary/5 border border-primary/20">
                            <div>
                                <div className="text-lg font-black text-primary">Plano Anual</div>
                                <div className="text-sm text-muted-foreground">Válido até 15 de Dezembro de 2026</div>
                            </div>
                            <Button variant="outline" className="rounded-xl border-2 font-bold">Gerenciar</Button>
                        </div>
                    </div>

                    {/* Section: Security/Devices */}
                    <div className="p-8 rounded-[40px] bg-card border">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-black">Dispositivos Conectados</h3>
                            <span className="text-xs font-bold text-muted-foreground bg-muted px-3 py-1 rounded-full">
                                {devices.length} de 3 usados
                            </span>
                        </div>

                        <div className="space-y-4">
                            {devices.map((device) => (
                                <div key={device.id} className="flex items-center justify-between p-6 rounded-3xl border hover:bg-muted/10 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center">
                                            {device.os === "iOS" ? <Smartphone className="w-6 h-6" /> : <Monitor className="w-6 h-6" />}
                                        </div>
                                        <div>
                                            <div className="font-bold">{device.name}</div>
                                            <div className="text-xs text-muted-foreground">{device.browser} • {device.lastIp} • {device.lastSeen}</div>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-danger font-bold hover:bg-danger/10"
                                        onClick={() => removeDevice(device.id)}
                                    >
                                        Remover
                                    </Button>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 p-6 rounded-3xl bg-muted/30 border border-dashed flex items-start gap-4">
                            <Shield className="w-5 h-5 text-success mt-1" />
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Sua segurança é nossa prioridade. Se você não reconhecer algum dispositivo, remova-o imediatamente e troque sua senha.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
