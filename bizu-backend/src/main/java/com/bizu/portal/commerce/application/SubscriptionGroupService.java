package com.bizu.portal.commerce.application;

import com.bizu.portal.commerce.domain.Plan;
import com.bizu.portal.commerce.domain.SubscriptionGroup;
import com.bizu.portal.commerce.infrastructure.SubscriptionGroupRepository;
import com.bizu.portal.identity.domain.User;
import com.bizu.portal.identity.infrastructure.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SubscriptionGroupService {

    private final SubscriptionGroupRepository groupRepository;
    private final UserRepository userRepository;

    @Transactional
    public SubscriptionGroup createGroup(User owner, Plan plan) {
        if (!plan.isGroup()) {
            throw new RuntimeException("Este plano não suporta assinatura em grupo");
        }

        return groupRepository.save(SubscriptionGroup.builder()
            .owner(owner)
            .plan(plan)
            .expiresAt(OffsetDateTime.now().plusMonths(1))
            .active(true)
            .build());
    }

    @Transactional
    public void addMember(UUID groupId, String memberEmail) {
        SubscriptionGroup group = groupRepository.findById(groupId)
            .orElseThrow(() -> new RuntimeException("Grupo não encontrado"));

        if (group.getMembers().size() >= group.getPlan().getMaxMembers()) {
            throw new RuntimeException("Limite de membros do grupo atingido");
        }

        User member = userRepository.findByEmail(memberEmail)
            .orElseThrow(() -> new RuntimeException("Usuário não cadastrado no portal"));

        if (group.getMembers().contains(member)) {
            throw new RuntimeException("Usuário já é membro deste grupo");
        }

        group.getMembers().add(member);
        groupRepository.save(group);
    }

    @Transactional(readOnly = true)
    public SubscriptionGroup findGroupByOwner(UUID ownerId) {
        return groupRepository.findByOwnerId(ownerId)
            .orElseThrow(() -> new RuntimeException("Você não possui uma assinatura em grupo ativa"));
    }

    @Transactional
    public void removeMember(UUID groupId, UUID memberId) {
        SubscriptionGroup group = groupRepository.findById(groupId)
            .orElseThrow(() -> new RuntimeException("Grupo não encontrado"));
        
        group.getMembers().removeIf(m -> m.getId().equals(memberId));
        groupRepository.save(group);
    }
}
