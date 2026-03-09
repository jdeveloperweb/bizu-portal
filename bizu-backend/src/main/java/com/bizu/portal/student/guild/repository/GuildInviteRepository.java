package com.bizu.portal.student.guild.repository;

import com.bizu.portal.student.guild.domain.GuildInvite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface GuildInviteRepository extends JpaRepository<GuildInvite, UUID> {
    List<GuildInvite> findAllByInviteeIdAndStatus(UUID inviteeId, GuildInvite.Status status);
    List<GuildInvite> findAllByGuildIdAndStatus(UUID guildId, GuildInvite.Status status);
    java.util.Optional<GuildInvite> findByGuildIdAndInviteeIdAndStatus(UUID guildId, UUID inviteeId, GuildInvite.Status status);
}
