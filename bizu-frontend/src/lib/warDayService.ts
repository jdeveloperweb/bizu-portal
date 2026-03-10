import { apiFetch } from "./api";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WarDayEvent {
  id: string;
  title: string;
  description?: string;
  status: "UPCOMING" | "ACTIVE" | "FINISHED" | "CANCELLED";
  startAt: string;
  endAt: string;
  xpRewardPerCorrect: number;
  minGuildSize: number;
  courseId?: string;
  mapTemplate?: MapTemplate;
  guildJoined: boolean;
  guildScore?: number;
  guildZonesConquered?: number;
}

export interface MapTemplate {
  id: string;
  name: string;
  description?: string;
  zones: ZoneTemplate[];
  createdAt?: string;
}

export interface ZoneTemplate {
  id: string;
  name: string;
  zoneType: "CAMP" | "WATCHTOWER" | "FORTRESS" | "CASTLE" | "BOSS";
  difficultyLevel: number;
  positionX: number;
  positionY: number;
  questionCount: number;
  pointsPerCorrect: number;
  terrainType: string;
  displayOrder: number;
  prerequisiteZoneIds: string[];
}

export interface ZoneState extends ZoneTemplate {
  zoneId: string;
  status: "LOCKED" | "AVAILABLE" | "IN_PROGRESS" | "CONQUERED";
  questionsAnswered: number;
  correctAnswers: number;
  totalPoints: number;
  conqueredAt?: string;
  progressPercent: number;
}

export interface GuildMapState {
  eventId: string;
  guildId: string;
  guildName: string;
  totalScore: number;
  zonesConquered: number;
  sessionStatus: string;
  zones: ZoneState[];
}

export interface QuestionResponse {
  questionId: string;
  statement: string;
  options: Record<string, string>;
  imageBase64?: string;
  difficulty?: string;
  questionsAnswered: number;
  correctAnswers: number;
  questionCount: number;
  zoneStatus: string;
}

export interface AnswerResult {
  correct: boolean;
  correctAnswer: string;
  resolution?: string;
  pointsEarned: number;
  correctAnswers: number;
  questionsAnswered: number;
  questionCount: number;
  zoneStatus: string;
  guildTotalScore: number;
  zoneConquered: boolean;
  newlyUnlockedZones: string[];
}

export interface GuildRankingEntry {
  position: number;
  guildId: string;
  guildName: string;
  guildBadge?: string;
  totalScore: number;
  zonesConquered: number;
  isMyGuild?: boolean;
}

export interface RankingResponse {
  eventId: string;
  eventTitle: string;
  eventStatus: string;
  guilds: GuildRankingEntry[];
}

// WebSocket events
export interface MapUpdateEvent {
  type: "ZONE_CONQUERED" | "ZONE_UNLOCKED" | "SCORE_UPDATE";
  zoneId: string;
  zoneName: string;
  newStatus: string;
  newlyUnlockedZones: string[];
  guildTotalScore: number;
  zonesConquered: number;
  conqueredByNickname?: string;
}

export interface RankingUpdateEvent {
  type: "RANKING_UPDATE";
  ranking: GuildRankingEntry[];
}

// Admin types
export interface CreateEventRequest {
  title: string;
  description?: string;
  startAt: string;
  endAt: string;
  mapTemplateId?: string;
  xpRewardPerCorrect: number;
  courseId?: string;
  minGuildSize: number;
}

export interface CreateMapTemplateRequest {
  name: string;
  description?: string;
  zones: CreateZoneRequest[];
}

export interface CreateZoneRequest {
  name: string;
  zoneType: string;
  difficultyLevel: number;
  positionX: number;
  positionY: number;
  questionCount: number;
  pointsPerCorrect: number;
  terrainType: string;
  displayOrder: number;
  prerequisiteZoneIds: string[];
}

// ─── Student API ──────────────────────────────────────────────────────────────

export const WarDayService = {
  getActive: async (): Promise<WarDayEvent | null> => {
    try {
      const res = await apiFetch("/war-day/active");
      if (!res.ok) return null;
      return res.json();
    } catch {
      return null;
    }
  },

  getUpcoming: async (): Promise<WarDayEvent[]> => {
    const res = await apiFetch("/war-day/upcoming");
    return res.json();
  },

  getEvent: async (id: string): Promise<WarDayEvent> => {
    const res = await apiFetch(`/war-day/${id}`);
    if (!res.ok) throw new Error("Evento não encontrado");
    return res.json();
  },

  joinEvent: async (id: string): Promise<GuildMapState> => {
    const res = await apiFetch(`/war-day/${id}/join`, { method: "POST" });
    if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.message ?? "Erro ao entrar no evento"); }
    return res.json();
  },

  getMap: async (id: string): Promise<GuildMapState> => {
    const res = await apiFetch(`/war-day/${id}/map`);
    if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.message ?? "Erro ao carregar mapa"); }
    return res.json();
  },

  getQuestion: async (eventId: string, zoneId: string): Promise<QuestionResponse> => {
    const res = await apiFetch(`/war-day/${eventId}/zone/${zoneId}/question`);
    if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.message ?? "Erro ao buscar questão"); }
    return res.json();
  },

  submitAnswer: async (
    eventId: string,
    zoneId: string,
    questionId: string,
    selectedAnswer: string
  ): Promise<AnswerResult> => {
    const res = await apiFetch(`/war-day/${eventId}/zone/${zoneId}/answer`, {
      method: "POST",
      body: JSON.stringify({ questionId, selectedAnswer }),
    });
    if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.message ?? "Erro ao enviar resposta"); }
    return res.json();
  },

  getRanking: async (eventId: string): Promise<RankingResponse> => {
    const res = await apiFetch(`/war-day/${eventId}/ranking`);
    return res.json();
  },
};

// ─── Admin API ────────────────────────────────────────────────────────────────

export const AdminWarDayService = {
  listEvents: async (): Promise<WarDayEvent[]> => {
    const res = await apiFetch("/admin/war-day");
    return res.json();
  },

  createEvent: async (req: CreateEventRequest): Promise<WarDayEvent> => {
    const res = await apiFetch("/admin/war-day", { method: "POST", body: JSON.stringify(req) });
    if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.message ?? "Erro ao criar evento"); }
    return res.json();
  },

  updateEvent: async (id: string, req: CreateEventRequest): Promise<WarDayEvent> => {
    const res = await apiFetch(`/admin/war-day/${id}`, { method: "PUT", body: JSON.stringify(req) });
    if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.message ?? "Erro ao atualizar evento"); }
    return res.json();
  },

  deleteEvent: async (id: string): Promise<void> => {
    await apiFetch(`/admin/war-day/${id}`, { method: "DELETE" });
  },

  forceStart: async (id: string): Promise<WarDayEvent> => {
    const res = await apiFetch(`/admin/war-day/${id}/start`, { method: "POST" });
    return res.json();
  },

  forceEnd: async (id: string): Promise<WarDayEvent> => {
    const res = await apiFetch(`/admin/war-day/${id}/end`, { method: "POST" });
    return res.json();
  },

  getEventRankings: async (id: string): Promise<GuildRankingEntry[]> => {
    const res = await apiFetch(`/admin/war-day/${id}/rankings`);
    return res.json();
  },

  listMapTemplates: async (): Promise<MapTemplate[]> => {
    const res = await apiFetch("/admin/war-day/map-templates");
    return res.json();
  },

  createMapTemplate: async (req: CreateMapTemplateRequest): Promise<MapTemplate> => {
    const res = await apiFetch("/admin/war-day/map-templates", { method: "POST", body: JSON.stringify(req) });
    if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.message ?? "Erro ao criar template"); }
    return res.json();
  },

  updateMapTemplate: async (id: string, req: CreateMapTemplateRequest): Promise<MapTemplate> => {
    const res = await apiFetch(`/admin/war-day/map-templates/${id}`, { method: "PUT", body: JSON.stringify(req) });
    if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.message ?? "Erro ao atualizar template"); }
    return res.json();
  },
};
