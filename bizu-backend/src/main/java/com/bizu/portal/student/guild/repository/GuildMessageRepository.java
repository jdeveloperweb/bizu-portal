package com.bizu.portal.student.guild.repository;

import com.bizu.portal.student.guild.domain.GuildMessage;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface GuildMessageRepository extends JpaRepository<GuildMessage, UUID> {
    List<GuildMessage> findAllByGuildIdOrderByCreatedAtDesc(UUID guildId, Pageable pageable);
}
