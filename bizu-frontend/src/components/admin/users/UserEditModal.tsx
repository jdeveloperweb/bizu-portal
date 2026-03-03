"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Users, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPhone } from "@/lib/utils";
import type { AdminUser, Plan, UserFormState } from "@/types/admin/user";

interface UserEditModalProps {
  isOpen: boolean;
  editingUser: AdminUser | null;
  formUser: UserFormState;
  plans: Plan[];
  isPlansLoading: boolean;
  isPlansError: boolean;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (form: UserFormState) => void;
  onClose: () => void;
}

export function UserEditModal({
  isOpen,
  editingUser,
  formUser,
  plans,
  isPlansLoading,
  isPlansError,
  isSubmitting,
  onSubmit,
  onChange,
  onClose,
}: UserEditModalProps) {
  return (
    <AnimatePresence>
      {isOpen && editingUser && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="w-full max-w-md rounded-3xl p-8 shadow-2xl bg-white border border-slate-100"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 leading-tight">Editar Usuário</h2>
                <p className="text-sm font-medium text-slate-400">
                  ID: {editingUser.id?.substring(0, 8) ?? "—"}...
                </p>
              </div>
            </div>

            <form onSubmit={onSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                  Nome Completo
                </label>
                <input
                  autoFocus
                  required
                  placeholder="Nome do aluno"
                  value={formUser.name}
                  onChange={(e) => onChange({ ...formUser, name: e.target.value })}
                  className="input-field h-12 px-4 rounded-xl border-slate-200 focus:ring-primary/10"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                  E-mail
                </label>
                <input
                  required
                  type="email"
                  placeholder="email@exemplo.com"
                  value={formUser.email}
                  onChange={(e) => onChange({ ...formUser, email: e.target.value })}
                  className="input-field h-12 px-4 rounded-xl border-slate-200 focus:ring-primary/10"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                  Telefone
                </label>
                <input
                  placeholder="(00) 00000-0000"
                  value={formUser.phone}
                  onChange={(e) => onChange({ ...formUser, phone: formatPhone(e.target.value) })}
                  className="input-field h-12 px-4 rounded-xl border-slate-200 focus:ring-primary/10"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                  Plano & Curso
                </label>
                {isPlansError ? (
                  <div className="flex items-center gap-2 h-12 px-4 rounded-xl border border-red-200 bg-red-50 text-red-600 text-sm font-medium">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    Falha ao carregar planos. Salvar está bloqueado.
                  </div>
                ) : (
                  <div className="relative">
                    <select
                      value={formUser.planId}
                      onChange={(e) => onChange({ ...formUser, planId: e.target.value })}
                      disabled={isPlansLoading}
                      className="flex w-full h-12 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all appearance-none disabled:opacity-60"
                    >
                      <option value="">Plano Free (Sem curso vinculado)</option>
                      {plans.map((plan) => (
                        <option key={plan.id} value={plan.id}>
                          {plan.name} {plan.course ? `(${plan.course.title})` : ""} - R$ {plan.price}
                        </option>
                      ))}
                    </select>
                    {isPlansLoading && (
                      <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 animate-spin" />
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 h-12 rounded-2xl font-bold border-slate-200 text-slate-500 hover:bg-slate-50"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1 h-12 rounded-2xl font-black shadow-lg shadow-primary/20"
                  disabled={isSubmitting || isPlansError}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Salvando...
                    </span>
                  ) : (
                    "Salvar Alterações"
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
