package com.bizu.portal.identity.infrastructure;

import com.bizu.portal.identity.domain.Device;
import com.bizu.portal.identity.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DeviceRepository extends JpaRepository<Device, UUID> {
    List<Device> findAllByUser(User user);
    List<Device> findAllByUserId(UUID userId);
    Optional<Device> findByUserAndDeviceFingerprint(User user, String fingerprint);
}
