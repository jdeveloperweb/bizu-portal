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
  getActive: (): Promise<WarDayEvent | null> =>
    apiFetch("/war-day/active").catch(() => null),

  getUpcoming: (): Promise<WarDayEvent[]> =>
    apiFetch("/war-day/upcoming"),

  getEvent: (id: string): Promise<WarDayEvent> =>
    apiFetch(`/war-day/${id}`),

  joinEvent: (id: string): Promise<GuildMapState> =>
    apiFetch(`/war-day/${id}/join`, { method: "POST" }),

  getMap: (id: string): Promise<GuildMapState> =>
    apiFetch(`/war-day/${id}/map`),

  getQuestion: (eventId: string, zoneId: string): Promise<QuestionResponse> =>
    apiFetch(`/war-day/${eventId}/zone/${zoneId}/question`),

  submitAnswer: (
    eventId: string,
    zoneId: string,
    questionId: string,
    selectedAnswer: string
  ): Promise<AnswerResult> =>
    apiFetch(`/war-day/${eventId}/zone/${zoneId}/answer`, {
      method: "POST",
      body: JSON.stringify({ questionId, selectedAnswer }),
    }),

  getRanking: (eventId: string): Promise<RankingResponse> =>
    apiFetch(`/war-day/${eventId}/ranking`),
};

// ─── Admin API ────────────────────────────────────────────────────────────────

export const AdminWarDayService = {
  listEvents: (): Promise<WarDayEvent[]> =>
    apiFetch("/admin/war-day"),

  createEvent: (req: CreateEventRequest): Promise<WarDayEvent> =>
    apiFetch("/admin/war-day", { method: "POST", body: JSON.stringify(req) }),

  updateEvent: (id: string, req: CreateEventRequest): Promise<WarDayEvent> =>
    apiFetch(`/admin/war-day/${id}`, { method: "PUT", body: JSON.stringify(req) }),

  deleteEvent: (id: string): Promise<void> =>
    apiFetch(`/admin/war-day/${id}`, { method: "DELETE" }),

  forceStart: (id: string): Promise<WarDayEvent> =>
    apiFetch(`/admin/war-day/${id}/start`, { method: "POST" }),

  forceEnd: (id: string): Promise<WarDayEvent> =>
    apiFetch(`/admin/war-day/${id}/end`, { method: "POST" }),

  getEventRankings: (id: string): Promise<GuildRankingEntry[]> =>
    apiFetch(`/admin/war-day/${id}/rankings`),

  listMapTemplates: (): Promise<MapTemplate[]> =>
    apiFetch("/admin/war-day/map-templates"),

  createMapTemplate: (req: CreateMapTemplateRequest): Promise<MapTemplate> =>
    apiFetch("/admin/war-day/map-templates", { method: "POST", body: JSON.stringify(req) }),

  updateMapTemplate: (id: string, req: CreateMapTemplateRequest): Promise<MapTemplate> =>
    apiFetch(`/admin/war-day/map-templates/${id}`, { method: "PUT", body: JSON.stringify(req) }),
};
