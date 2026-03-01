"use client";

import { useState } from "react";
import { AlertTriangle, Loader2, X } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";

interface ResetPlatformModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ResetPlatformModal({ isOpen, onClose }: ResetPlatformModalProps) {
    const [confirmationText, setConfirmationText] = useState("");
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleReset = async () => {
        if (confirmationText !== "CONFIRMAR") {
            toast.error("Você deve digitar CONFIRMAR para prosseguir.");
            return;
        }

        setLoading(true);
        try {
            const res = await apiFetch(`/admin/maintenance/reset-content`, {
                method: "DELETE",
                body: JSON.stringify({ confirmation: confirmationText }),
            });

            if (res.ok) {
                toast.success("Plataforma resetada com sucesso!");
                onClose();
            } else {
                const data = await res.json();
                toast.error(data.error || "Erro ao resetar plataforma");
            }
        } catch (error) {
            console.error(error);
            toast.error("Erro de conexão com o servidor");
        } finally {
            setLoading(false);
            setConfirmationText("");
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-card w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-destructive/20 scale-in-center">
                <div className="flex items-center justify-between px-6 py-5 border-b border-border/50 bg-destructive/5 text-destructive">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="w-6 h-6" />
                        <h2 className="text-lg font-bold">Zerar Plataforma (Danger Zone)</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-destructive/10 transition-colors"
                        disabled={loading}
                    >
                        <X className="w-5 h-5 text-destructive" />
                    </button>
                </div>

                <div className="px-6 py-6 space-y-6">
                    <div className="bg-destructive/10 text-destructive p-4 rounded-xl border border-destructive/20 text-sm font-medium leading-relaxed">
                        <span className="font-bold block mb-1">Atenção! Esta ação é irreversível.</span>
                        Isso irá excluir permanentemente todos os Cursos, Módulos, Aulas, Materiais, Simulados, Flashcards e <strong>todo o progresso</strong> associado dos alunos. Os alunos não serão deletados, mas perderão todo o histórico e acesso ao conteúdo limpo.
                    </div>

                    <div className="space-y-3">
                        <label className="text-sm font-bold text-foreground">
                            Para confirmar, digite <span className="text-destructive">CONFIRMAR</span> abaixo:
                        </label>
                        <input
                            type="text"
                            value={confirmationText}
                            onChange={(e) => setConfirmationText(e.target.value)}
                            className="w-full h-12 px-4 rounded-xl bg-background border border-border focus:border-destructive focus:ring-2 focus:ring-destructive/20 outline-none transition-all font-mono font-bold text-center uppercase"
                            placeholder="CONFIRMAR"
                            disabled={loading}
                        />
                    </div>
                </div>

                <div className="px-6 py-5 border-t border-border/50 bg-muted/30 flex justify-end gap-3">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        disabled={loading}
                        className="rounded-xl font-bold h-11 px-6 hover:bg-muted"
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleReset}
                        disabled={confirmationText !== "CONFIRMAR" || loading}
                        className="rounded-xl font-bold h-11 px-6 shadow-lg shadow-destructive/20"
                    >
                        {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                        {loading ? "Apagando Dados..." : "Zerar Plataforma Agora"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
