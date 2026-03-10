package com.bizu.portal.student.api.war;

import lombok.*;

import java.util.List;
import java.util.Set;
import java.util.UUID;

// ─── Event DTOs ──────────────────────────────────────────────────────────────

public class WarDayDTO {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EventResponse {
        private UUID id;
        private String title;
        private String description;
        private String status;
        private String startAt;
        private String endAt;
        private int xpRewardPerCorrect;
        private int minGuildSize;
        private UUID courseId;
        private MapTemplateResponse mapTemplate;
        private boolean guildJoined;
        private Long guildScore;
        private Integer guildZonesConquered;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EventCreateRequest {
        private String title;
        private String description;
        private String startAt;
        private String endAt;
        private UUID mapTemplateId;
        private int xpRewardPerCorrect;
        private UUID courseId;
        private int minGuildSize;
    }

    // ─── Map Template ─────────────────────────────────────────────────────────

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MapTemplateResponse {
        private UUID id;
        private String name;
        private String description;
        private List<ZoneTemplateResponse> zones;
        private String createdAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MapTemplateCreateRequest {
        private String name;
        private String description;
        private List<ZoneTemplateCreateRequest> zones;
    }

    // ─── Zone Template ────────────────────────────────────────────────────────

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ZoneTemplateResponse {
        private UUID id;
        private String name;
        private String zoneType;
        private int difficultyLevel;
        private double positionX;
        private double positionY;
        private int questionCount;
        private int pointsPerCorrect;
        private String terrainType;
        private int displayOrder;
        private Set<UUID> prerequisiteZoneIds;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ZoneTemplateCreateRequest {
        private String name;
        private String zoneType;
        private int difficultyLevel;
        private double positionX;
        private double positionY;
        private int questionCount;
        private int pointsPerCorrect;
        private String terrainType;
        private int displayOrder;
        private Set<UUID> prerequisiteZoneIds;
    }

    // ─── Map State (Guild view) ───────────────────────────────────────────────

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GuildMapState {
        private UUID eventId;
        private UUID guildId;
        private String guildName;
        private long totalScore;
        private int zonesConquered;
        private String sessionStatus;
        private List<ZoneState> zones;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ZoneState {
        private UUID zoneId;
        private String name;
        private String zoneType;
        private int difficultyLevel;
        private double positionX;
        private double positionY;
        private int questionCount;
        private int pointsPerCorrect;
        private String terrainType;
        private Set<UUID> prerequisiteZoneIds;
        // Progress fields
        private String status; // LOCKED, AVAILABLE, IN_PROGRESS, CONQUERED
        private int questionsAnswered;
        private int correctAnswers;
        private long totalPoints;
        private String conqueredAt;
        // Progress percentage for UI
        private double progressPercent;
    }

    // ─── Zone Battle ──────────────────────────────────────────────────────────

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuestionResponse {
        private UUID questionId;
        private String statement;
        private java.util.Map<String, Object> options;
        private String imageBase64;
        private String difficulty;
        private int questionsAnswered;
        private int correctAnswers;
        private int questionCount;
        private String zoneStatus;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AnswerRequest {
        private UUID questionId;
        private String selectedAnswer;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AnswerResult {
        private boolean correct;
        private String correctAnswer;
        private String resolution;
        private int pointsEarned;
        private int correctAnswers;
        private int questionsAnswered;
        private int questionCount;
        private String zoneStatus; // updated zone status
        private long guildTotalScore;
        private boolean zoneConquered;
        private List<UUID> newlyUnlockedZones;
    }

    // ─── Ranking ──────────────────────────────────────────────────────────────

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GuildRankingEntry {
        private int position;
        private UUID guildId;
        private String guildName;
        private String guildBadge;
        private long totalScore;
        private int zonesConquered;
        private boolean isMyGuild;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RankingResponse {
        private UUID eventId;
        private String eventTitle;
        private String eventStatus;
        private List<GuildRankingEntry> guilds;
    }

    // ─── WebSocket Events ─────────────────────────────────────────────────────

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MapUpdateEvent {
        private String type; // ZONE_CONQUERED, ZONE_UNLOCKED, SCORE_UPDATE
        private UUID zoneId;
        private String zoneName;
        private String newStatus;
        private List<UUID> newlyUnlockedZones;
        private long guildTotalScore;
        private int zonesConquered;
        private String conqueredByNickname;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RankingUpdateEvent {
        private String type; // RANKING_UPDATE
        private List<GuildRankingEntry> ranking;
    }
}
