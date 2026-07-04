package com.placementcompass.api.dto.request;

import com.placementcompass.api.entity.InterviewRoundOutcome;
import com.placementcompass.api.entity.InterviewRoundType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * CreateInterviewRoundRequest — validated body for
 * POST /api/applications/{applicationId}/rounds
 *
 * Design notes:
 * - roundNumber must be ≥ 1 (no "round 0").
 * - type is mandatory so the timeline icon is always deterministic.
 * - outcome defaults to PENDING in the service if not supplied by the client.
 * - All other fields are optional — useful when a round is just "scheduled".
 */
@Data
public class CreateInterviewRoundRequest {

    /** Position in the interview sequence — 1-indexed. */
    @NotNull(message = "Round number is required")
    @Min(value = 1, message = "Round number must be at least 1")
    private Integer roundNumber;

    /** Category/format of this round (drives the timeline icon). */
    @NotNull(message = "Round type is required")
    private InterviewRoundType type;

    /**
     * Result after the round — optional on creation.
     * If omitted, the service assigns PENDING automatically.
     */
    private InterviewRoundOutcome outcome;

    /** Scheduled date and time for the round. */
    private LocalDateTime scheduledAt;

    /** Estimated or actual duration in minutes. */
    @Min(value = 1, message = "Duration must be at least 1 minute")
    private Integer durationMinutes;

    /** Name / designation of the interviewer if known. */
    @Size(max = 150, message = "Interviewer name must be at most 150 characters")
    private String interviewer;

    /** Platform used: Zoom, Google Meet, In-person, HackerRank, etc. */
    @Size(max = 100, message = "Platform must be at most 100 characters")
    private String platform;

    /** Prep notes, topics covered, or feedback received after the round. */
    @Size(max = 2000, message = "Notes must be at most 2000 characters")
    private String notes;
}
