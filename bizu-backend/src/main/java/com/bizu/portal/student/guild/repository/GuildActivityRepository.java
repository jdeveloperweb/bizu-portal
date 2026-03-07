package com.bizu.portal.student.guild.repository;

import com.bizu.portal.student.guild.domain.GuildActivity;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface GuildActivityRepository extends JpaRepository<GuildActivity, UUID> {
    List<GuildActivity> findAllByGuildIdOrderByCreatedAtDesc(UUID guildId, Pageable pageable);
}
