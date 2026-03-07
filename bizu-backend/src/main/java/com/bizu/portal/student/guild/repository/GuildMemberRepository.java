package com.bizu.portal.student.guild.repository;

import com.bizu.portal.student.guild.domain.GuildMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface GuildMemberRepository extends JpaRepository<GuildMember, UUID> {
    List<GuildMember> findAllByGuildId(UUID guildId);
    Optional<GuildMember> findByGuildIdAndUserId(UUID guildId, UUID userId);
    List<GuildMember> findAllByUserId(UUID userId);
}
