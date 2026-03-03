"use client";

import { useEffect } from "react";
import PageHeader from "@/components/PageHeader";
import {
  Users,
  Search,
  Filter,
  Download,
  Mail,
  Calendar,
  Shield,
  ExternalLink,
  Trash2,
  TrendingUp,
  Lock,
  Unlock,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";
import { useAdminUsers } from "@/hooks/useAdminUsers";
import { UserEditModal } from "@/components/admin/users/UserEditModal";

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 },
};

export default function AdminUsuariosPage() {
  const { user: currentUser } = useAuth();
  const {
    filteredUsers,
    users,
    isLoading,
    isError,
    plans,
    isPlansLoading,
    isPlansError,
    isSubmitting,
    searchTerm,
    setSearchTerm,
    isEditing,
    editingUser,
    formUser,
    setFormUser,
    fetchUsers,
    handleEditClick,
    handleUpdateUser,
    handleDeleteUser,
    handleUnlockArena,
    handleCancelEdit,
    canDeleteUser,
  } = useAdminUsers(currentUser?.email);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="w-full px-8 py-10"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <PageHeader
          title="Gestão de Alunos"
          description="Monitore o progresso, planos e atividades de todos os usuários cadastrados."
          badge="COMMUNITY"
        />
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            variant="outline"
            disabled
            title="Em breve"
            className="btn-ghost border-slate-200 h-11 px-6 rounded-xl gap-2 hover:border-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            Exportar CSV
          </Button>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-10">
        <div className="lg:col-span-2 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Buscar por nome ou e-mail..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10 h-12 shadow-sm border-slate-200 focus:ring-primary/10"
          />
        </div>
        <div className="flex gap-4 lg:col-span-2">
          <Button
            variant="outline"
            disabled
            title="Em breve"
            className="h-12 flex-1 rounded-xl gap-2 font-bold border-slate-200 text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Filter className="w-4 h-4 text-slate-300" />
            Filtros
          </Button>
          <div className="h-12 px-5 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center font-bold text-slate-700 gap-3 min-w-[160px]">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="w-4 h-4 text-primary" />
            </div>
            <span className="text-sm tracking-tight">
              <span className="text-primary font-black text-lg">{users.length}</span> ALUNOS
            </span>
          </div>
        </div>
      </div>

      <motion.div
        variants={itemVariants}
        className="card-elevated overflow-hidden border-none shadow-xl shadow-slate-200/50"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Aluno</th>
                <th className="px-8 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Plano / Curso</th>
                <th className="px-8 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Cadastro</th>
                <th className="px-8 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Progresso</th>
                <th className="px-8 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <AnimatePresence mode="popLayout">
                {isLoading ? (
                  <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <td colSpan={5} className="px-8 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                        <span className="text-sm font-medium text-slate-400">Carregando alunos...</span>
                      </div>
                    </td>
                  </motion.tr>
                ) : isError ? (
                  <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <td colSpan={5} className="px-8 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <AlertCircle className="w-8 h-8 text-red-400 opacity-60" />
                        <span className="text-sm font-medium text-slate-500">Erro ao carregar alunos.</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={fetchUsers}
                          className="rounded-xl border-slate-200 text-slate-600 font-bold"
                        >
                          Tentar novamente
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ) : filteredUsers.length === 0 ? (
                  <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <td colSpan={5} className="px-8 py-16 text-center text-slate-400 font-medium">
                      <div className="flex flex-col items-center gap-2">
                        <Search className="w-8 h-8 opacity-20" />
                        <span>Nenhum aluno encontrado.</span>
                      </div>
                    </td>
                  </motion.tr>
                ) : (
                  filteredUsers.map((user) => (
                    <motion.tr
                      layout
                      key={user.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="hover:bg-slate-50 transition-colors group relative"
                    >
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center font-bold text-primary text-xs border border-primary/10">
                            {user.name ? user.name.substring(0, 2).toUpperCase() : "NA"}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 leading-tight mb-0.5">
                              {user.name || "Sem Nome"}
                            </div>
                            <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                              <Mail className="w-3 h-3" />
                              {user.email || "Sem e-mail"}
                            </div>
                            {user.phone && (
                              <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1.5 mt-0.5">
                                <div className="w-3 h-3 flex items-center justify-center">📞</div>
                                {user.phone}
                              </div>
                            )}
                            {user.abandonBlockedUntil && new Date(user.abandonBlockedUntil) > new Date() && (
                              <div className="flex items-center gap-1 mt-1 text-[9px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100 w-fit">
                                <Lock className="w-2.5 h-2.5" />
                                BLOQUEADO ARENA
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex flex-col gap-1">
                          <span
                            className={`pill text-[10px] w-fit ${
                              user.plan === "FREE" ? "pill-success" : "pill-primary"
                            } uppercase tracking-wider`}
                          >
                            <Shield className="w-3 h-3" />
                            {user.plan || "Free"}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight ml-1">
                            {user.courseTitle || "Nenhum curso"}
                          </span>
                          {user.currentPeriodEnd && (
                            <span className="text-[9px] font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100 w-fit mt-1">
                              Expira: {new Date(user.currentPeriodEnd).toLocaleDateString("pt-BR")}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {user.joined}
                        </div>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <div className="inline-flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                          <TrendingUp className="w-3 h-3 text-emerald-500" />
                          <span className="font-bold text-slate-700 text-xs">{user.xp ?? 0} XP</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-1 group-hover:translate-x-0">
                          {user.abandonBlockedUntil && new Date(user.abandonBlockedUntil) > new Date() && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleUnlockArena(user.id, user.name ?? "")}
                              className="rounded-lg h-9 w-9 text-amber-500 hover:text-amber-600 hover:bg-amber-50"
                              title="Desbloquear Arena"
                            >
                              <Unlock className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditClick(user)}
                            className="rounded-lg h-9 w-9 text-slate-400 hover:text-primary hover:bg-primary/5"
                            title="Editar Usuário"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                          {canDeleteUser(user.email) && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteUser(user.id, user.name ?? "")}
                              className="rounded-lg h-9 w-9 text-slate-400 hover:text-red-500 hover:bg-red-50"
                              title="Apagar Usuário"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </motion.div>

      <UserEditModal
        isOpen={isEditing}
        editingUser={editingUser}
        formUser={formUser}
        plans={plans}
        isPlansLoading={isPlansLoading}
        isPlansError={isPlansError}
        isSubmitting={isSubmitting}
        onSubmit={handleUpdateUser}
        onChange={setFormUser}
        onClose={handleCancelEdit}
      />
    </motion.div>
  );
}
