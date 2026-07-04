package com.placementcompass.api.dto.response;

import com.placementcompass.api.entity.ApplicationStatus;
import com.placementcompass.api.entity.JobApplication;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

/**
 * ApplicationResponse — the public-facing shape of a JobApplication.
 *
 * Why not return the entity directly?
 * The entity contains userId (internal reference) and other fields we may not
 * want to expose. The response DTO is our API contract with the frontend.
 * If we ever rename an entity field, the DTO stays the same — no breaking change.
 *
 * The static factory method `from(JobApplication)` makes mapping explicit and
 * keeps all conversion logic in one place (no MapStruct needed for this scale).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApplicationResponse {

    private String id;
    private String companyName;
    private String role;
    private String jobUrl;
    private ApplicationStatus status;
    private String source;
    private LocalDate applicationDate;
    private LocalDate nextActionDate;
    private String notes;
    private String ctcOffered;
    private Instant createdAt;
    private Instant updatedAt;

    /** Embedded interview rounds — populated from the embedded array in the entity. */
    private List<InterviewRoundResponse> rounds;

    /**
     * Static factory: converts a JobApplication entity into this response DTO.
     * We intentionally omit userId — the client already knows who they are.
     */
    public static ApplicationResponse from(JobApplication app) {
        List<InterviewRoundResponse> rounds = app.getRounds() == null
                ? List.of()
                : app.getRounds().stream()
                        .map(InterviewRoundResponse::from)
                        .collect(Collectors.toList());

        return ApplicationResponse.builder()
                .id(app.getId())
                .companyName(app.getCompanyName())
                .role(app.getRole())
                .jobUrl(app.getJobUrl())
                .status(app.getStatus())
                .source(app.getSource())
                .applicationDate(app.getApplicationDate())
                .nextActionDate(app.getNextActionDate())
                .notes(app.getNotes())
                .ctcOffered(app.getCtcOffered())
                .createdAt(app.getCreatedAt())
                .updatedAt(app.getUpdatedAt())
                .rounds(rounds)
                .build();
    }
}
