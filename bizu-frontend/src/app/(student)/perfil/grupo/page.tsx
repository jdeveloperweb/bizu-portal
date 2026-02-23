"use client";

import PageHeader from "../../../../components/PageHeader";
import {
    Users,
    UserPlus,
    UserMinus,
    ShieldCheck,
    Mail,
    Crown,
    Settings,
    AlertCircle
} from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { useState } from "react";

export default function GroupManagementPage() {
    const [members, setMembers] = useState([
        { id: "1", name: "Você (Dono)", email: "jaime@bizu.com", role: "OWNER", joinedAt: "20/02/2026" },
        { id: "2", name: "Carlos André", email: "carlos@gmail.com", role: "MEMBER", joinedAt: "21/02/2026" },
        { id: "3", name: "Fernanda Lima", email: "fer.lima@outlook.com", role: "MEMBER", joinedAt: "22/02/2026" },
    ]);

    const [inviteEmail, setInviteEmail] = useState("");
    const maxMembers = 5;

    const removeMember = (id: string) => {
        setMembers(prev => prev.filter(m => m.id !== id));
    };

    const addMember = (e: React.FormEvent) => {
        e.preventDefault();
        if (members.length >= maxMembers) return;
        if (!inviteEmail) return;

        setMembers(prev => [...prev, {
            id: Math.random().toString(),
            name: "Convite Pendente",
            email: inviteEmail,
            role: "MEMBER",
            joinedAt: "Hoje"
        }]);
        setInviteEmail("");
    };

    return (
        <div className="container mx-auto px-4 py-12 max-w-5xl">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <PageHeader
                    title="Gestão do Grupo"
                    description="Gerencie os acessos da sua assinatura compartilhada. Você pode convidar até 5 pessoas."
                    badge="SUBSCRIPTION"
                />
                <div className="flex items-center gap-4 bg-primary/5 px-6 py-3 rounded-2xl border border-primary/20">
                    <Users className="w-5 h-5 text-primary" />
                    <span className="font-black text-lg">{members.length} / {maxMembers}</span>
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Membros</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-card border rounded-[40px] overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-muted/50 border-b">
                                <tr>
                                    <th className="px-8 py-4 text-xs font-black text-muted-foreground uppercase tracking-widest">Usuário</th>
                                    <th className="px-8 py-4 text-xs font-black text-muted-foreground uppercase tracking-widest">Cargo</th>
                                    <th className="px-8 py-4 text-right text-xs font-black text-muted-foreground uppercase tracking-widest">Ação</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {members.map((member) => (
                                    <tr
                                        key={member.id}
                                        className="hover:bg-muted/20 transition-colors group"
                                    >
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center font-bold text-sm">
                                                    {member.name.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-bold">{member.name}</div>
                                                    <div className="text-xs text-muted-foreground font-medium">{member.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            {member.role === 'OWNER' ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full">
                                                    <Crown className="w-3 h-3" />
                                                    Dono
                                                </span>
                                            ) : (
                                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Membro</span>
                                            )}
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            {member.role !== 'OWNER' && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeMember(member.id)}
                                                    className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl"
                                                >
                                                    <UserMinus className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {members.length < maxMembers && (
                        <div className="p-8 rounded-[40px] border-2 border-dashed flex flex-col items-center text-center space-y-4">
                            <UserPlus className="w-10 h-10 text-muted-foreground" />
                            <div>
                                <div className="font-black text-lg">Espaço Disponível</div>
                                <p className="text-sm text-muted-foreground font-medium italic">Você ainda pode adicionar mais {maxMembers - members.length} pessoas.</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    <div className="p-8 rounded-[40px] bg-card border space-y-6">
                        <h3 className="text-xl font-black">Convidar Membro</h3>
                        <form onSubmit={addMember} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">E-mail do Convidado</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input
                                        type="email"
                                        value={inviteEmail}
                                        onChange={(e) => setInviteEmail(e.target.value)}
                                        placeholder="exemplo@email.com"
                                        className="w-full h-14 pl-12 pr-4 rounded-2xl bg-muted/50 border focus:border-primary outline-none transition-all font-medium text-sm"
                                    />
                                </div>
                            </div>
                            <Button
                                disabled={members.length >= maxMembers}
                                className="w-full h-14 rounded-2xl font-black text-lg shadow-xl shadow-primary/20"
                            >
                                Enviar Convite
                            </Button>
                        </form>
                    </div>

                    <div className="p-8 rounded-[40px] bg-warning/5 border border-warning/20 space-y-4">
                        <div className="flex items-center gap-3 text-warning">
                            <AlertCircle className="w-5 h-5" />
                            <h4 className="font-black text-sm uppercase tracking-widest">Importante</h4>
                        </div>
                        <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                            Cada membro convidado terá seu próprio acesso individual, progresso e ranking. <br /><br />
                            O compartilhamento da senha principal não é recomendado por questões de segurança.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
