package com.placementcompass.api.controller;

import com.placementcompass.api.dto.request.CreateInterviewRoundRequest;
import com.placementcompass.api.dto.request.UpdateInterviewRoundRequest;
import com.placementcompass.api.dto.response.InterviewRoundResponse;
import com.placementcompass.api.security.UserDetailsImpl;
import com.placementcompass.api.service.JobApplicationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * InterviewRoundController — REST endpoints for managing interview rounds
 * embedded inside a JobApplication.
 *
 * Base URL: /api/applications/{applicationId}/rounds
 *
 * Design rationale (nested resource URL):
 * - Interview rounds have no independent existence; they belong exclusively to
 *   a single JobApplication. The nested URL makes that ownership explicit and
 *   allows Spring Security + the service layer to enforce it on every call.
 *
 * Endpoints:
 *   POST   /api/applications/{appId}/rounds              → Add a round
 *   GET    /api/applications/{appId}/rounds              → List all rounds
 *   PATCH  /api/applications/{appId}/rounds/{roundId}   → Update a round
 *   DELETE /api/applications/{appId}/rounds/{roundId}   → Delete a round
 *
 * Security:
 * - JWT must be present (handled by AuthTokenFilter upstream).
 * - @PreAuthorize("isAuthenticated()") ensures the caller has a valid JWT for any role
 *   (ROLE_STUDENT, ROLE_ADMIN, ROLE_RECRUITER — all pass through).
 * - The service's findAndVerifyOwnership() guarantees the authenticated user
 *   owns the parent application before any round operation executes.
 */
@RestController
@RequestMapping("/api/applications/{applicationId}/rounds")
@RequiredArgsConstructor
public class InterviewRoundController {

    private final JobApplicationService applicationService;

    // ─────────────────────────────────────────────────────────────
    // POST /api/applications/{applicationId}/rounds  →  Add
    // ─────────────────────────────────────────────────────────────

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<InterviewRoundResponse> addRound(
            @AuthenticationPrincipal UserDetailsImpl currentUser,
            @PathVariable String applicationId,
            @Valid @RequestBody CreateInterviewRoundRequest request) {

        InterviewRoundResponse response = applicationService.addRound(
                currentUser.getId(), applicationId, request);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // ─────────────────────────────────────────────────────────────
    // GET /api/applications/{applicationId}/rounds  →  List
    // ─────────────────────────────────────────────────────────────

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<InterviewRoundResponse>> getRounds(
            @AuthenticationPrincipal UserDetailsImpl currentUser,
            @PathVariable String applicationId) {

        List<InterviewRoundResponse> rounds = applicationService.getRounds(
                currentUser.getId(), applicationId);

        return ResponseEntity.ok(rounds);
    }

    // ─────────────────────────────────────────────────────────────
    // PATCH /api/applications/{applicationId}/rounds/{roundId}  →  Update
    // ─────────────────────────────────────────────────────────────

    @PatchMapping("/{roundId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<InterviewRoundResponse> updateRound(
            @AuthenticationPrincipal UserDetailsImpl currentUser,
            @PathVariable String applicationId,
            @PathVariable String roundId,
            @Valid @RequestBody UpdateInterviewRoundRequest request) {

        InterviewRoundResponse response = applicationService.updateRound(
                currentUser.getId(), applicationId, roundId, request);

        return ResponseEntity.ok(response);
    }

    // ─────────────────────────────────────────────────────────────
    // DELETE /api/applications/{applicationId}/rounds/{roundId}  →  Delete
    // ─────────────────────────────────────────────────────────────

    @DeleteMapping("/{roundId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteRound(
            @AuthenticationPrincipal UserDetailsImpl currentUser,
            @PathVariable String applicationId,
            @PathVariable String roundId) {

        applicationService.deleteRound(currentUser.getId(), applicationId, roundId);
        return ResponseEntity.noContent().build();  // 204 No Content
    }
}
