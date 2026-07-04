package com.placementcompass.api.service;

import com.placementcompass.api.dto.request.CreateApplicationRequest;
import com.placementcompass.api.dto.request.CreateInterviewRoundRequest;
import com.placementcompass.api.dto.request.UpdateApplicationRequest;
import com.placementcompass.api.dto.request.UpdateInterviewRoundRequest;
import com.placementcompass.api.dto.response.ApplicationResponse;
import com.placementcompass.api.dto.response.ApplicationSummaryResponse;
import com.placementcompass.api.dto.response.InterviewRoundResponse;
import com.placementcompass.api.entity.ApplicationStatus;
import com.placementcompass.api.entity.InterviewRound;
import com.placementcompass.api.entity.InterviewRoundOutcome;
import com.placementcompass.api.entity.JobApplication;
import com.placementcompass.api.exception.ResourceNotFoundException;
import com.placementcompass.api.repository.JobApplicationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * JobApplicationService — business logic layer for application CRUD.
 *
 * Key responsibilities:
 * 1. Map DTOs → entities (create) and entities → DTOs (read).
 * 2. Enforce user ownership on every read/update/delete operation.
 * 3. Apply partial updates (PATCH semantics) — only update non-null fields.
 * 4. Aggregate summary statistics for the dashboard.
 *
 * Why @Slf4j?
 * Lombok generates a `log` field. We use it to record ownership violations
 * at WARN level — useful for detecting scraping attempts or bugs in the frontend
 * without throwing noisy stack traces into the logs.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class JobApplicationService {

    private final JobApplicationRepository applicationRepository;

    // ─────────────────────────────────────────────────────────────
    // CREATE
    // ─────────────────────────────────────────────────────────────

    /**
     * Persists a new job application owned by the authenticated user.
     *
     * @param userId  Extracted from the JWT by the controller (never trusted from client body).
     * @param request Validated create request DTO.
     * @return The saved application as a response DTO.
     */
    public ApplicationResponse createApplication(String userId, CreateApplicationRequest request) {
        JobApplication application = JobApplication.builder()
                .userId(userId)
                .companyName(request.getCompanyName())
                .role(request.getRole())
                .jobUrl(request.getJobUrl())
                .status(request.getStatus())
                .source(request.getSource())
                .applicationDate(request.getApplicationDate())
                .nextActionDate(request.getNextActionDate())
                .notes(request.getNotes())
                .ctcOffered(request.getCtcOffered())
                .build();

        JobApplication saved = applicationRepository.save(application);
        log.info("User [{}] created application [{}] for company [{}]", userId, saved.getId(), saved.getCompanyName());
        return ApplicationResponse.from(saved);
    }

    // ─────────────────────────────────────────────────────────────
    // READ
    // ─────────────────────────────────────────────────────────────

    /**
     * Returns a paginated list of applications for the authenticated user.
     * Optionally filtered by status if the `status` param is provided.
     */
    public Page<ApplicationResponse> getApplications(String userId, ApplicationStatus status, Pageable pageable) {
        Page<JobApplication> page;

        if (status != null) {
            page = applicationRepository.findByUserIdAndStatus(userId, status, pageable);
        } else {
            page = applicationRepository.findByUserId(userId, pageable);
        }

        return page.map(ApplicationResponse::from);
    }

    /**
     * Returns a single application by ID, enforcing ownership.
     * Throws ResourceNotFoundException (→ 404) if not found or not owned by userId.
     */
    public ApplicationResponse getApplicationById(String userId, String applicationId) {
        JobApplication application = findAndVerifyOwnership(userId, applicationId);
        return ApplicationResponse.from(application);
    }

    // ─────────────────────────────────────────────────────────────
    // UPDATE (PATCH)
    // ─────────────────────────────────────────────────────────────

    /**
     * Applies a partial update to an existing application.
     * Only non-null fields in the request are applied.
     */
    public ApplicationResponse updateApplication(String userId, String applicationId, UpdateApplicationRequest request) {
        JobApplication application = findAndVerifyOwnership(userId, applicationId);

        // PATCH logic: only update fields that the client actually sent
        if (request.getCompanyName() != null) application.setCompanyName(request.getCompanyName());
        if (request.getRole()        != null) application.setRole(request.getRole());
        if (request.getJobUrl()      != null) application.setJobUrl(request.getJobUrl());
        if (request.getStatus()      != null) application.setStatus(request.getStatus());
        if (request.getSource()      != null) application.setSource(request.getSource());
        if (request.getApplicationDate()  != null) application.setApplicationDate(request.getApplicationDate());
        if (request.getNextActionDate()   != null) application.setNextActionDate(request.getNextActionDate());
        if (request.getNotes()       != null) application.setNotes(request.getNotes());
        if (request.getCtcOffered()  != null) application.setCtcOffered(request.getCtcOffered());

        JobApplication updated = applicationRepository.save(application);
        log.info("User [{}] updated application [{}]", userId, applicationId);
        return ApplicationResponse.from(updated);
    }

    // ─────────────────────────────────────────────────────────────
    // DELETE
    // ─────────────────────────────────────────────────────────────

    /**
     * Deletes an application, enforcing ownership.
     */
    public void deleteApplication(String userId, String applicationId) {
        JobApplication application = findAndVerifyOwnership(userId, applicationId);
        applicationRepository.delete(application);
        log.info("User [{}] deleted application [{}]", userId, applicationId);
    }

    // ─────────────────────────────────────────────────────────────
    // SUMMARY (Dashboard)
    // ─────────────────────────────────────────────────────────────

    /**
     * Returns per-status counts for the authenticated user.
     * Each countByUserIdAndStatus call hits the compound (userId, status) index — fast.
     */
    public ApplicationSummaryResponse getSummary(String userId) {
        return ApplicationSummaryResponse.builder()
                .totalApplications(applicationRepository.countByUserId(userId))
                .applied(applicationRepository.countByUserIdAndStatus(userId, ApplicationStatus.APPLIED))
                .oa(applicationRepository.countByUserIdAndStatus(userId, ApplicationStatus.OA))
                .interview(applicationRepository.countByUserIdAndStatus(userId, ApplicationStatus.INTERVIEW))
                .offer(applicationRepository.countByUserIdAndStatus(userId, ApplicationStatus.OFFER))
                .rejected(applicationRepository.countByUserIdAndStatus(userId, ApplicationStatus.REJECTED))
                .withdrawn(applicationRepository.countByUserIdAndStatus(userId, ApplicationStatus.WITHDRAWN))
                .build();
    }

    // ─────────────────────────────────────────────────────────────
    // INTERVIEW ROUNDS
    // ─────────────────────────────────────────────────────────────

    /**
     * Appends a new interview round to the given application.
     * A UUID is generated for the roundId — this is the stable key used by
     * PATCH and DELETE to target a specific round in the embedded array.
     *
     * If the client does not supply an outcome, PENDING is used as the default.
     */
    public InterviewRoundResponse addRound(String userId, String applicationId, CreateInterviewRoundRequest request) {
        JobApplication application = findAndVerifyOwnership(userId, applicationId);

        InterviewRound round = InterviewRound.builder()
                .roundId(UUID.randomUUID().toString())
                .roundNumber(request.getRoundNumber())
                .type(request.getType())
                .outcome(request.getOutcome() != null ? request.getOutcome() : InterviewRoundOutcome.PENDING)
                .scheduledAt(request.getScheduledAt())
                .durationMinutes(request.getDurationMinutes())
                .interviewer(request.getInterviewer())
                .platform(request.getPlatform())
                .notes(request.getNotes())
                .build();

        application.getRounds().add(round);
        applicationRepository.save(application);
        log.info("User [{}] added round [{}] (type={}) to application [{}]",
                userId, round.getRoundId(), round.getType(), applicationId);
        return InterviewRoundResponse.from(round);
    }

    /**
     * Returns all rounds for the given application, sorted by roundNumber ascending.
     */
    public List<InterviewRoundResponse> getRounds(String userId, String applicationId) {
        JobApplication application = findAndVerifyOwnership(userId, applicationId);
        return application.getRounds().stream()
                .sorted(Comparator.comparingInt(InterviewRound::getRoundNumber))
                .map(InterviewRoundResponse::from)
                .collect(Collectors.toList());
    }

    /**
     * Applies a partial update to a specific round identified by roundId.
     * Throws ResourceNotFoundException if the roundId does not exist in the application.
     */
    public InterviewRoundResponse updateRound(String userId, String applicationId,
                                              String roundId, UpdateInterviewRoundRequest request) {
        JobApplication application = findAndVerifyOwnership(userId, applicationId);

        InterviewRound round = application.getRounds().stream()
                .filter(r -> r.getRoundId().equals(roundId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Interview round not found with id: " + roundId));

        // PATCH semantics — only update non-null fields
        if (request.getRoundNumber()    != null) round.setRoundNumber(request.getRoundNumber());
        if (request.getType()           != null) round.setType(request.getType());
        if (request.getOutcome()        != null) round.setOutcome(request.getOutcome());
        if (request.getScheduledAt()    != null) round.setScheduledAt(request.getScheduledAt());
        if (request.getDurationMinutes() != null) round.setDurationMinutes(request.getDurationMinutes());
        if (request.getInterviewer()    != null) round.setInterviewer(request.getInterviewer());
        if (request.getPlatform()       != null) round.setPlatform(request.getPlatform());
        if (request.getNotes()          != null) round.setNotes(request.getNotes());

        applicationRepository.save(application);
        log.info("User [{}] updated round [{}] of application [{}]", userId, roundId, applicationId);
        return InterviewRoundResponse.from(round);
    }

    /**
     * Removes a specific round from the embedded array and saves.
     */
    public void deleteRound(String userId, String applicationId, String roundId) {
        JobApplication application = findAndVerifyOwnership(userId, applicationId);

        boolean removed = application.getRounds()
                .removeIf(r -> r.getRoundId().equals(roundId));

        if (!removed) {
            throw new ResourceNotFoundException("Interview round not found with id: " + roundId);
        }

        applicationRepository.save(application);
        log.info("User [{}] deleted round [{}] from application [{}]", userId, roundId, applicationId);
    }

    // ─────────────────────────────────────────────────────────────
    // PRIVATE HELPERS
    // ─────────────────────────────────────────────────────────────

    /**
     * Fetches an application and verifies the requesting user owns it.
     * Returns 404 for both "not found" and "wrong owner" — see ResourceNotFoundException javadoc.
     */
    private JobApplication findAndVerifyOwnership(String userId, String applicationId) {
        JobApplication application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Application not found with id: " + applicationId));

        if (!application.getUserId().equals(userId)) {
            log.warn("User [{}] attempted to access application [{}] owned by [{}]",
                    userId, applicationId, application.getUserId());
            throw new ResourceNotFoundException(
                    "Application not found with id: " + applicationId);
        }

        return application;
    }
}
