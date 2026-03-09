package com.bizu.portal.student.api;

import com.bizu.portal.identity.application.UserService;
import com.bizu.portal.student.application.QuestService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/student/quests")
@RequiredArgsConstructor
public class QuestController {

    private final QuestService questService;
    private final UserService userService;

    @GetMapping("/me")
    public List<QuestService.QuestDTO> getMyQuests(@AuthenticationPrincipal Jwt jwt) {
        return questService.getUserQuests(userService.resolveUserId(jwt));
    }

    @PostMapping("/{code}/claim")
    public QuestService.ClaimResultDTO claimQuest(@AuthenticationPrincipal Jwt jwt, @PathVariable String code) {
        return questService.claimQuest(userService.resolveUserId(jwt), code);
    }
}
