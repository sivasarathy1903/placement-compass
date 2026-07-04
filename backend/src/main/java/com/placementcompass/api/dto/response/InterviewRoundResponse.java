package com.placementcompass.api.dto.response;

import com.placementcompass.api.entity.InterviewRound;
import com.placementcompass.api.entity.InterviewRoundOutcome;
import com.placementcompass.api.entity.InterviewRoundType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * InterviewRoundResponse — the public-facing shape of an InterviewRound.
 *
 * Follows the same pattern as ApplicationResponse:
 * - Static factory `from(InterviewRound)` handles all entity → DTO mapping.
 * - No internal entity fields leak through (consistent API contract).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewRoundResponse {

    /** Stable UUID identifying this specific round — needed by the client for PATCH/DELETE. */
    private String roundId;

    /** 1-indexed position of this round in the interview sequence. */
    private int roundNumber;

    /** Category/format of the round (TECHNICAL, HR, SYSTEM_DESIGN, etc.). */
    private InterviewRoundType type;

    /** Current outcome: PENDING, PASSED, FAILED, or ON_HOLD. */
    private InterviewRoundOutcome outcome;

    /** Scheduled date and time. */
    private LocalDateTime scheduledAt;

    /** Estimated or actual duration in minutes. */
    private Integer durationMinutes;

    /** Interviewer name or designation. */
    private String interviewer;

    /** Platform used (Zoom, Google Meet, In-person, etc.). */
    private String platform;

    /** Prep notes, topics covered, or post-round feedback. */
    private String notes;

    /**
     * Static factory: converts an InterviewRound embedded document to this response DTO.
     */
    public static InterviewRoundResponse from(InterviewRound round) {
        return InterviewRoundResponse.builder()
                .roundId(round.getRoundId())
                .roundNumber(round.getRoundNumber())
                .type(round.getType())
                .outcome(round.getOutcome())
                .scheduledAt(round.getScheduledAt())
                .durationMinutes(round.getDurationMinutes())
                .interviewer(round.getInterviewer())
                .platform(round.getPlatform())
                .notes(round.getNotes())
                .build();
    }
}
