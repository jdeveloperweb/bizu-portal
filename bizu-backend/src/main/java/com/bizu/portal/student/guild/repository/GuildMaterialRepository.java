package com.bizu.portal.student.guild.repository;

import com.bizu.portal.student.guild.domain.GuildMaterial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface GuildMaterialRepository extends JpaRepository<GuildMaterial, UUID> {
    List<GuildMaterial> findAllByGuildIdOrderByCreatedAtDesc(UUID guildId);
}
