package com.bizu.portal.student.guild.repository;

import com.bizu.portal.student.guild.domain.Guild;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface GuildRepository extends JpaRepository<Guild, UUID> {
    java.util.List<Guild> findAllByCourseId(UUID courseId);
    java.util.List<Guild> findAllByCourseIdOrCourseIdIsNull(UUID courseId);
}
