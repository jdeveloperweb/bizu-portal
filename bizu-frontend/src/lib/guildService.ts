import { apiFetch } from "@/lib/api";

// ─── Response DTOs (mirrors backend exactly) ─────────────────────────────────

export interface GuildResponseDTO {
  id: string;
  name: string;
  description: string;
  badge: string;
  memberCount: number;
  maxMembers: number;
  totalXp: number;
  weeklyXp: number;
  rankPosition: number;
  league: string;
  streak: number;
  isPublic: boolean;
  isAdmin: boolean;
  isFounder: boolean;
  isMember: boolean;
  tags: string[];
  createdAt: string;
  weeklyGoal: number;
  weeklyProgress: number;
}

export interface GuildMemberDTO {
  id: string;
  name: string;
  nickname: string;
  level: number;
  xp: number;
  role: "founder" | "admin" | "member";
  streak: number;
  joinDate: string;
  avatar: string | null;
  online: boolean;
}

export interface GuildRequestDTO {
  id: string;
  name: string;
  nickname: string;
  level: number;
  message: string;
}

export interface GuildMemberResponseDTO {
  members: GuildMemberDTO[];
  pendingRequests: GuildRequestDTO[];
}

export interface GuildMaterialDTO {
  id: string;
  title: string;
  type: string; // pdf | video | link
  uploader: string;
  size: string | null;
  date: string;
  url: string;
}

export interface GuildMissionDTO {
  id: string;
  title: string;
  type: string; // daily | weekly | monthly
  description: string;
  progress: number;
  total: number;
  xpReward: number;
  endsAt: string | null;
  completed: boolean;
}

export interface GuildActivityDTO {
  id: string;
  user: string;
  action: string;
  xp: number;
  time: string;
}

export interface GuildMessageDTO {
  id: string;
  user: string;
  text: string;
  time: string;
  isMe: boolean;
}

export interface GuildCreateRequestDTO {
  name: string;
  description: string;
  badge: string;
  isPublic: boolean;
  maxMembers: number;
  invitedUserIds: string[];
}

export interface GuildNoteDTO {
  id: string;
  title: string;
  content: string;
  author: string;
  updatedAt: string;
}

export interface GuildTaskDTO {
  id: string;
  title: string;
  description: string | null;
  priority: string; // LOW | MEDIUM | HIGH
  status: string;   // TODO | IN_PROGRESS | DONE
  assignee: string;
  dueDate: string | null;
}

export interface GuildFlashcardDeckDTO {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  cardCount: number;
}

export interface GuildFlashcardDTO {
  id: string;
  front: string;
  back: string;
}

export interface GuildInviteDTO {
  id: string;
  guildId: string;
  guildName: string;
  badge: string;
  inviterName: string;
  createdAt: string;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const GuildService = {
  /** GET /student/guilds?search= */
  async getGuilds(search?: string): Promise<GuildResponseDTO[]> {
    const qs = search ? `?search=${encodeURIComponent(search)}` : "";
    const res = await apiFetch(`/student/guilds${qs}`);
    if (!res.ok) throw new Error("Erro ao buscar guilds");
    return res.json();
  },

  /** GET /student/guilds/{id} */
  async getGuild(id: string): Promise<GuildResponseDTO> {
    const res = await apiFetch(`/student/guilds/${id}`);
    if (!res.ok) throw new Error("Guild não encontrada");
    return res.json();
  },

  /** PUT /student/guilds/{id} */
  async updateGuild(id: string, request: Partial<GuildCreateRequestDTO> & { weeklyGoal?: number }): Promise<GuildResponseDTO> {
    const res = await apiFetch(`/student/guilds/${id}`, {
      method: "PUT",
      body: JSON.stringify(request),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Erro ao atualizar guild");
    }
    return res.json();
  },

  /** POST /student/guilds */
  async createGuild(request: GuildCreateRequestDTO): Promise<GuildResponseDTO> {
    const res = await apiFetch("/student/guilds", {
      method: "POST",
      body: JSON.stringify(request),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Erro ao criar guild");
    }
    return res.json();
  },

  /** GET /student/guilds/{id}/members */
  async getMembers(id: string): Promise<GuildMemberResponseDTO> {
    const res = await apiFetch(`/student/guilds/${id}/members`);
    if (!res.ok) throw new Error("Erro ao buscar membros");
    return res.json();
  },

  /** GET /student/guilds/{id}/materials */
  async getMaterials(id: string): Promise<GuildMaterialDTO[]> {
    const res = await apiFetch(`/student/guilds/${id}/materials`);
    if (!res.ok) throw new Error("Erro ao buscar materiais");
    return res.json();
  },

  /** GET /student/guilds/{id}/missions */
  async getMissions(id: string): Promise<GuildMissionDTO[]> {
    const res = await apiFetch(`/student/guilds/${id}/missions`);
    if (!res.ok) throw new Error("Erro ao buscar missões");
    return res.json();
  },

  /** GET /student/guilds/{id}/activity */
  async getActivity(id: string): Promise<GuildActivityDTO[]> {
    const res = await apiFetch(`/student/guilds/${id}/activity`);
    if (!res.ok) throw new Error("Erro ao buscar atividade");
    return res.json();
  },

  /** GET /student/guilds/{id}/chat */
  async getChatMessages(id: string): Promise<GuildMessageDTO[]> {
    const res = await apiFetch(`/student/guilds/${id}/chat`);
    if (!res.ok) throw new Error("Erro ao buscar mensagens");
    return res.json();
  },

  /** POST /student/guilds/{id}/chat */
  async sendMessage(id: string, text: string): Promise<GuildMessageDTO> {
    const res = await apiFetch(`/student/guilds/${id}/chat`, {
      method: "POST",
      body: JSON.stringify({ text }),
    });
    if (!res.ok) throw new Error("Erro ao enviar mensagem");
    return res.json();
  },

  /** GET /student/guilds/{id}/notes */
  async getNotes(id: string): Promise<GuildNoteDTO[]> {
    const res = await apiFetch(`/student/guilds/${id}/notes`);
    if (!res.ok) throw new Error("Erro ao buscar anotações");
    return res.json();
  },

  /** GET /student/guilds/{id}/tasks */
  async getTasks(id: string): Promise<GuildTaskDTO[]> {
    const res = await apiFetch(`/student/guilds/${id}/tasks`);
    if (!res.ok) throw new Error("Erro ao buscar tarefas");
    return res.json();
  },

  /** GET /student/guilds/{id}/flashcards */
  async getFlashcardDecks(id: string): Promise<GuildFlashcardDeckDTO[]> {
    const res = await apiFetch(`/student/guilds/${id}/flashcards`);
    if (!res.ok) throw new Error("Erro ao buscar decks");
    return res.json();
  },

  /** GET /student/guilds/{id}/flashcards/{deckId}/cards */
  async getFlashcardCards(guildId: string, deckId: string): Promise<GuildFlashcardDTO[]> {
    const res = await apiFetch(`/student/guilds/${guildId}/flashcards/${deckId}/cards`);
    if (!res.ok) throw new Error("Erro ao buscar flashcards");
    return res.json();
  },

  /** GET /friends/search?nickname= (reused for invite autocomplete) */
  async searchUsers(query: string): Promise<{ id: string; name: string; nickname: string; level: number }[]> {
    const res = await apiFetch(`/friends/search?nickname=${encodeURIComponent(query)}`);
    if (!res.ok) return [];
    const data = await res.json();
    // Normalise varying response shapes
    return (Array.isArray(data) ? data : data.content ?? []).map((u: any) => ({
      id: u.id,
      name: u.name ?? u.fullName ?? "Usuário",
      nickname: u.nickname ?? u.username ?? "",
      level: Math.floor(u.level ?? 1),
    }));
  },

  /** GET /student/guilds/invites */
  async getPendingInvites(): Promise<GuildInviteDTO[]> {
    const res = await apiFetch("/student/guilds/invites");
    if (!res.ok) throw new Error("Erro ao buscar convites");
    return res.json();
  },

  /** POST /student/guilds/invites/{id}/accept */
  async acceptInvite(inviteId: string): Promise<void> {
    const res = await apiFetch(`/student/guilds/invites/${inviteId}/accept`, {
      method: "POST",
    });
    if (!res.ok) throw new Error("Erro ao aceitar convite");
  },

  /** POST /student/guilds/invites/{id}/decline */
  async declineInvite(inviteId: string): Promise<void> {
    const res = await apiFetch(`/student/guilds/invites/${inviteId}/decline`, {
      method: "POST",
    });
    if (!res.ok) throw new Error("Erro ao recusar convite");
  },

  /** POST /student/guilds/{id}/join */
  async joinGuild(guildId: string): Promise<void> {
    const res = await apiFetch(`/student/guilds/${guildId}/join`, {
      method: "POST",
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Erro ao entrar na guild");
    }
  },

  /** POST /student/guilds/{id}/leave */
  async leaveGuild(guildId: string): Promise<void> {
    const res = await apiFetch(`/student/guilds/${guildId}/leave`, {
      method: "POST",
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Erro ao sair da guild");
    }
  },

  /** GET /student/guilds/me */
  async getMyGuilds(): Promise<GuildResponseDTO[]> {
    const res = await apiFetch("/student/guilds/me");
    if (!res.ok) throw new Error("Erro ao buscar minhas guilds");
    return res.json();
  },

  /** POST /student/guilds/{guildId}/requests/{requestId}/approve */
  async approveRequest(guildId: string, requestId: string): Promise<void> {
    const res = await apiFetch(`/student/guilds/${guildId}/requests/${requestId}/approve`, { method: "POST" });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Erro ao aprovar pedido");
    }
  },

  /** POST /student/guilds/{guildId}/requests/{requestId}/decline */
  async declineRequest(guildId: string, requestId: string): Promise<void> {
    const res = await apiFetch(`/student/guilds/${guildId}/requests/${requestId}/decline`, { method: "POST" });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Erro ao recusar pedido");
    }
  },

  /** POST /student/guilds/{guildId}/members/{memberId}/promote */
  async promoteMember(guildId: string, memberId: string): Promise<void> {
    const res = await apiFetch(`/student/guilds/${guildId}/members/${memberId}/promote`, { method: "POST" });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Erro ao promover membro");
    }
  },

  /** POST /student/guilds/{guildId}/members/{memberId}/demote */
  async demoteMember(guildId: string, memberId: string): Promise<void> {
    const res = await apiFetch(`/student/guilds/${guildId}/members/${memberId}/demote`, { method: "POST" });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Erro ao rebaixar membro");
    }
  },

  /** DELETE /student/guilds/{guildId}/members/{memberId} */
  async kickMember(guildId: string, memberId: string): Promise<void> {
    const res = await apiFetch(`/student/guilds/${guildId}/members/${memberId}`, { method: "DELETE" });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Erro ao remover membro");
    }
  },

  /** POST /student/notes/{id}/share */
  async shareNote(noteId: string, targetType: "GUILD", targetId: string): Promise<void> {
    const res = await apiFetch(`/student/notes/${noteId}/share`, {
      method: "POST",
      body: JSON.stringify({ targetType, targetId }),
    });
    if (!res.ok) throw new Error("Erro ao compartilhar anotação");
  },

  /** POST /student/guilds/{id}/invites?userId={userId} */
  async inviteMember(guildId: string, userId: string): Promise<void> {
    const res = await apiFetch(`/student/guilds/${guildId}/invites?userId=${userId}`, {
      method: "POST",
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Erro ao convidar membro");
    }
  },

  /** POST /student/guilds/{id}/materials (multipart) */
  async uploadMaterial(guildId: string, file: File, title?: string): Promise<GuildMaterialDTO> {
    const formData = new FormData();
    formData.append("file", file);
    if (title) formData.append("title", title);

    const res = await apiFetch(`/student/guilds/${guildId}/materials`, {
      method: "POST",
      // apiFetch automatically handles content-type for FormData if not set
      body: formData,
      headers: {
        // Important: let the browser set the boundary
      }
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Erro ao fazer upload do material");
    }
    return res.json();
  },

  /** DELETE /student/guilds/{id} */
  async deleteGuild(id: string): Promise<void> {
    const res = await apiFetch(`/student/guilds/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Erro ao deletar guilda");
    }
  },
};
