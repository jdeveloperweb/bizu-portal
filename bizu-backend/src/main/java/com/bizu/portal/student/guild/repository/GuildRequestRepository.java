package com.bizu.portal.student.guild.repository;

import com.bizu.portal.student.guild.domain.GuildRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface GuildRequestRepository extends JpaRepository<GuildRequest, UUID> {
    List<GuildRequest> findAllByGuildIdAndStatus(UUID guildId, GuildRequest.Status status);
    List<GuildRequest> findAllByUserIdAndStatus(UUID userId, GuildRequest.Status status);
    List<GuildRequest> findAllByGuildIdAndUserIdAndStatus(UUID guildId, UUID userId, GuildRequest.Status status);
}
