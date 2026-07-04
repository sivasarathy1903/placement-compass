package com.placementcompass.api.controller;

import com.placementcompass.api.dto.request.CreateApplicationRequest;
import com.placementcompass.api.dto.request.UpdateApplicationRequest;
import com.placementcompass.api.dto.response.ApplicationResponse;
import com.placementcompass.api.dto.response.ApplicationSummaryResponse;
import com.placementcompass.api.entity.ApplicationStatus;
import com.placementcompass.api.security.UserDetailsImpl;
import com.placementcompass.api.service.JobApplicationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * JobApplicationController — REST endpoints for job application CRUD.
 *
 * Base URL: /api/applications
 *
 * Security:
 * - SecurityConfig already enforces .anyRequest().authenticated(), meaning every
 *   request must carry a valid JWT. The @PreAuthorize("isAuthenticated()") here
 *   is a second line of defence that also documents intent clearly.
 * - "isAuthenticated()" works for ALL roles (ROLE_STUDENT, ROLE_ADMIN, etc.)
 *   making this future-proof. No role-specific check is needed here because
 *   data isolation is enforced in the service layer via findAndVerifyOwnership().
 *
 * Previous bug:
 * - The old annotation was @PreAuthorize("hasAuthority('ROLE_USER')").
 *   Users registered via /api/auth/register receive ROLE_STUDENT (not ROLE_USER),
 *   so every request was rejected with AuthorizationDeniedException → HTTP 500.
 *
 * userId extraction:
 * - @AuthenticationPrincipal injects the UserDetailsImpl from the SecurityContext,
 *   which was populated by AuthTokenFilter when it validated the JWT.
 *   This means the userId is ALWAYS sourced from a verified JWT — never from the request body.
 *
 * Pagination:
 * - The list endpoint accepts `page` (0-indexed), `size`, and `sort` query params.
 *   Default: page=0, size=10, sorted by createdAt DESC (newest first).
 */
@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
public class JobApplicationController {

    private final JobApplicationService applicationService;

    // ─────────────────────────────────────────────────────────────
    // POST /api/applications  →  Create
    // ─────────────────────────────────────────────────────────────

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApplicationResponse> createApplication(
            @AuthenticationPrincipal UserDetailsImpl currentUser,
            @Valid @RequestBody CreateApplicationRequest request) {

        ApplicationResponse response = applicationService.createApplication(
                currentUser.getId(), request);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // ─────────────────────────────────────────────────────────────
    // GET /api/applications  →  List (paginated, filterable)
    // ─────────────────────────────────────────────────────────────

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<ApplicationResponse>> getApplications(
            @AuthenticationPrincipal UserDetailsImpl currentUser,
            @RequestParam(required = false) ApplicationStatus status,
            @RequestParam(defaultValue = "0")   int page,
            @RequestParam(defaultValue = "10")  int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        Sort sort = direction.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(page, size, sort);

        Page<ApplicationResponse> applications = applicationService.getApplications(
                currentUser.getId(), status, pageable);

        return ResponseEntity.ok(applications);
    }

    // ─────────────────────────────────────────────────────────────
    // GET /api/applications/summary  →  Dashboard aggregation
    // NOTE: This route must be declared BEFORE /{id} to avoid route conflict.
    // ─────────────────────────────────────────────────────────────

    @GetMapping("/summary")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApplicationSummaryResponse> getSummary(
            @AuthenticationPrincipal UserDetailsImpl currentUser) {

        ApplicationSummaryResponse summary = applicationService.getSummary(currentUser.getId());
        return ResponseEntity.ok(summary);
    }

    // ─────────────────────────────────────────────────────────────
    // GET /api/applications/{id}  →  Single application
    // ─────────────────────────────────────────────────────────────

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApplicationResponse> getApplicationById(
            @AuthenticationPrincipal UserDetailsImpl currentUser,
            @PathVariable String id) {

        ApplicationResponse response = applicationService.getApplicationById(
                currentUser.getId(), id);

        return ResponseEntity.ok(response);
    }

    // ─────────────────────────────────────────────────────────────
    // PATCH /api/applications/{id}  →  Partial update
    // ─────────────────────────────────────────────────────────────

    @PatchMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApplicationResponse> updateApplication(
            @AuthenticationPrincipal UserDetailsImpl currentUser,
            @PathVariable String id,
            @Valid @RequestBody UpdateApplicationRequest request) {

        ApplicationResponse response = applicationService.updateApplication(
                currentUser.getId(), id, request);

        return ResponseEntity.ok(response);
    }

    // ─────────────────────────────────────────────────────────────
    // DELETE /api/applications/{id}  →  Delete
    // ─────────────────────────────────────────────────────────────

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteApplication(
            @AuthenticationPrincipal UserDetailsImpl currentUser,
            @PathVariable String id) {

        applicationService.deleteApplication(currentUser.getId(), id);
        return ResponseEntity.noContent().build();  // 204 No Content
    }
}
