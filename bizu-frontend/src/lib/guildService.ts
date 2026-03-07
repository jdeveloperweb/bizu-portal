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
};
