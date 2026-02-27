package com.bizu.portal.identity.api.dto;

import java.util.UUID;
import java.time.OffsetDateTime;

public record FriendshipDto(
    UUID id,
    UserProfileDto requester,
    UserProfileDto addressee,
    String status,
    OffsetDateTime createdAt
) {}
