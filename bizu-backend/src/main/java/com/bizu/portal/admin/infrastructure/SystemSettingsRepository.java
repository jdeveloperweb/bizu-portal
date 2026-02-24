package com.bizu.portal.admin.infrastructure;

import com.bizu.portal.admin.domain.SystemSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SystemSettingsRepository extends JpaRepository<SystemSettings, String> {
}
