package com.bizu.portal.student.api;

import com.bizu.portal.identity.domain.User;
import com.bizu.portal.student.application.QuestService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/student/quests")
@RequiredArgsConstructor
public class QuestController {

    private final QuestService questService;

    @GetMapping("/me")
    public List<QuestService.QuestDTO> getMyQuests(@AuthenticationPrincipal User user) {
        return questService.getUserQuests(user.getId());
    }

    @PostMapping("/{code}/claim")
    public void claimQuest(@AuthenticationPrincipal User user, @PathVariable String code) {
        questService.claimQuest(user.getId(), code);
    }
}
