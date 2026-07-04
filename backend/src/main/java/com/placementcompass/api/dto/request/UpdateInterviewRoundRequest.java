package com.placementcompass.api.dto.request;

import com.placementcompass.api.entity.InterviewRoundOutcome;
import com.placementcompass.api.entity.InterviewRoundType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * UpdateInterviewRoundRequest — validated body for
 * PATCH /api/applications/{applicationId}/rounds/{roundId}
 *
 * All fields are optional (nullable). Only non-null fields are applied —
 * this is standard PATCH semantics, matching the UpdateApplicationRequest pattern.
 */
@Data
public class UpdateInterviewRoundRequest {

    /** New position in the sequence; must be ≥ 1 if provided. */
    @Min(value = 1, message = "Round number must be at least 1")
    private Integer roundNumber;

    /** New category/format. */
    private InterviewRoundType type;

    /** Updated outcome after completing the round. */
    private InterviewRoundOutcome outcome;

    /** Updated schedule. */
    private LocalDateTime scheduledAt;

    /** Updated duration in minutes. */
    @Min(value = 1, message = "Duration must be at least 1 minute")
    private Integer durationMinutes;

    /** Updated interviewer name. */
    @Size(max = 150, message = "Interviewer name must be at most 150 characters")
    private String interviewer;

    /** Updated platform. */
    @Size(max = 100, message = "Platform must be at most 100 characters")
    private String platform;

    /** Updated notes / feedback. */
    @Size(max = 2000, message = "Notes must be at most 2000 characters")
    private String notes;
}
