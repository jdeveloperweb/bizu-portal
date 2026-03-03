"use client";

import { useState, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import { formatPhone, digitsOnly } from "@/lib/utils";
import { useCustomDialog } from "@/components/CustomDialogProvider";
import type { AdminUser, Plan, UserFormState } from "@/types/admin/user";

export function useAdminUsers(currentUserEmail?: string) {
  const { alert, confirm } = useCustomDialog();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const [plans, setPlans] = useState<Plan[]>([]);
  const [isPlansLoading, setIsPlansLoading] = useState(false);
  const [isPlansError, setIsPlansError] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [formUser, setFormUser] = useState<UserFormState>({
    name: "",
    email: "",
    phone: "",
    planId: "",
  });

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const res = await apiFetch("/admin/users");
      if (res.ok) {
        const data: AdminUser[] = await res.json();
        const formatted = data.map((u) => ({
          ...u,
          joined: u.joined
            ? new Date(u.joined).toLocaleDateString("pt-BR", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : "N/A",
        }));
        setUsers(formatted);
      } else {
        setIsError(true);
      }
    } catch {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchPlans = useCallback(async (force = false) => {
    if (!force && plans.length > 0) return;
    setIsPlansLoading(true);
    setIsPlansError(false);
    try {
      const res = await apiFetch("/admin/plans");
      if (res.ok) {
        const data: Plan[] = await res.json();
        setPlans(data);
      } else {
        setIsPlansError(true);
      }
    } catch {
      setIsPlansError(true);
    } finally {
      setIsPlansLoading(false);
    }
  }, [plans.length]);

  const handleEditClick = useCallback((user: AdminUser) => {
    setEditingUser(user);
    setFormUser({
      name: user.name ?? "",
      email: user.email ?? "",
      phone: formatPhone(user.phone ?? ""),
      planId: user.planId ?? "",
    });
    setIsEditing(true);
    fetchPlans();
  }, [fetchPlans]);

  const handleUpdateUser = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser?.id) return;

    setIsSubmitting(true);
    try {
      const res = await apiFetch(`/admin/users/${editingUser.id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: formUser.name,
          email: formUser.email,
          phone: digitsOnly(formUser.phone),
          planId: formUser.planId || null,
        }),
      });

      if (res.ok) {
        await fetchUsers();
        setIsEditing(false);
        setEditingUser(null);
      } else {
        let errorMessage = "Falha ao atualizar usuário.";
        try {
          const body = await res.json();
          if (body?.message) errorMessage = body.message;
        } catch {
          // não era JSON — usa mensagem genérica
        }
        alert(errorMessage, { type: "danger" });
      }
    } catch {
      alert("Erro ao atualizar usuário.", { type: "danger" });
    } finally {
      setIsSubmitting(false);
    }
  }, [editingUser, formUser, fetchUsers, alert]);

  const handleDeleteUser = useCallback(async (id: string, name: string) => {
    const confirmed = await confirm(
      `Tem certeza que deseja apagar o usuário ${name || "este usuário"}? Esta ação é irreversível e removerá o acesso dele permanentemente.`,
      { type: "danger", title: "Apagar Usuário" }
    );
    if (!confirmed) return;

    try {
      const res = await apiFetch(`/admin/users/${id}`, { method: "DELETE" });
      if (res.ok) {
        await fetchUsers();
        alert("Usuário removido com sucesso.", { type: "success" });
      } else {
        alert("Falha ao apagar usuário.", { type: "danger" });
      }
    } catch {
      alert("Erro ao tentar apagar usuário.", { type: "danger" });
    }
  }, [fetchUsers, alert, confirm]);

  const handleUnlockArena = useCallback(async (userId: string, name: string) => {
    const confirmed = await confirm(
      `Deseja desbloquear o acesso à Arena para ${name || "este aluno"}?`,
      { title: "Desbloquear Arena" }
    );
    if (!confirmed) return;

    try {
      const res = await apiFetch(`/admin/users/${userId}/unlock-arena`, { method: "POST" });
      if (res.ok) {
        alert("Usuário desbloqueado com sucesso!", { type: "success" });
        await fetchUsers();
      } else {
        alert("Falha ao desbloquear usuário.", { type: "danger" });
      }
    } catch {
      alert("Erro ao tentar desbloquear Arena.", { type: "danger" });
    }
  }, [fetchUsers, alert, confirm]);

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
    setEditingUser(null);
  }, []);

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const canDeleteUser = useCallback(
    (userEmail?: string) => currentUserEmail !== userEmail,
    [currentUserEmail]
  );

  return {
    users,
    filteredUsers,
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
  };
}
