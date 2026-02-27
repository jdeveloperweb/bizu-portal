package com.bizu.portal.identity.api.dto;

import java.util.UUID;

public record UserProfileDto(
    UUID id,
    String nickname,
    String name,
    String avatarUrl
) {}
