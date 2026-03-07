package com.bizu.portal.student.guild.repository;

import com.bizu.portal.student.guild.domain.GuildMission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface GuildMissionRepository extends JpaRepository<GuildMission, UUID> {
    List<GuildMission> findAllByGuildId(UUID guildId);
}
