package com.bizu.portal.student.infrastructure;

import com.bizu.portal.student.domain.Attempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AttemptRepository extends JpaRepository<Attempt, UUID> {

    List<Attempt> findAllByUser_Id(UUID userId);
}
