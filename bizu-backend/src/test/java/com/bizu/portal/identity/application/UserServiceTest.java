package com.bizu.portal.identity.application;

import com.bizu.portal.identity.domain.User;
import com.bizu.portal.identity.infrastructure.KeycloakService;
import com.bizu.portal.identity.infrastructure.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private KeycloakService keycloakService;

    @InjectMocks
    private UserService userService;

    @Test
    void syncUser_marksPreAssignedIdUserAsNotNewBeforeSaving() {
        UUID userId = UUID.randomUUID();
        when(userRepository.findById(userId)).thenReturn(Optional.empty());
        when(userRepository.saveAndFlush(org.mockito.ArgumentMatchers.any(User.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        User saved = userService.syncUser(userId, "student@bizu.com", "Student");

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).saveAndFlush(userCaptor.capture());
        User persistedUser = userCaptor.getValue();

        assertThat(persistedUser.getId()).isEqualTo(userId);
        assertThat(persistedUser.isNew()).isFalse();
        assertThat(saved.isNew()).isFalse();
    }

    @Test
    void syncUser_returnsExistingUserWhenConcurrentInsertWinsRace() {
        UUID userId = UUID.randomUUID();
        when(userRepository.findById(userId)).thenReturn(
                Optional.empty(),
                Optional.of(User.builder()
                        .id(userId)
                        .email("student@bizu.com")
                        .name("Student")
                        .status("ACTIVE")
                        .build())
        );
        when(userRepository.saveAndFlush(org.mockito.ArgumentMatchers.any(User.class)))
                .thenThrow(new ObjectOptimisticLockingFailureException(User.class, userId));

        User saved = userService.syncUser(userId, "student@bizu.com", "Student");

        assertThat(saved.getId()).isEqualTo(userId);
        verify(userRepository).saveAndFlush(org.mockito.ArgumentMatchers.any(User.class));
    }
}
