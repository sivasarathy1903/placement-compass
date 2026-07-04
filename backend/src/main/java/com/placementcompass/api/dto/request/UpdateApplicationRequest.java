package com.placementcompass.api.dto.request;

import com.placementcompass.api.entity.ApplicationStatus;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

/**
 * UpdateApplicationRequest — the validated request body for PATCH /api/applications/{id}.
 *
 * Why all fields are Optional (nullable)?
 * A PATCH request is a *partial* update — the client only sends fields that changed.
 * If a field is null, the service skips updating it and keeps the existing value.
 *
 * This is different from PUT (full replacement) where all fields must be present.
 * PATCH is the correct semantic for "update only what changed" in REST.
 */
@Data
public class UpdateApplicationRequest {

    @Size(max = 150, message = "Company name must be at most 150 characters")
    private String companyName;

    @Size(max = 200, message = "Role must be at most 200 characters")
    private String role;

    @Size(max = 500, message = "Job URL must be at most 500 characters")
    private String jobUrl;

    // null = "don't change the status"
    private ApplicationStatus status;

    @Size(max = 100, message = "Source must be at most 100 characters")
    private String source;

    private LocalDate applicationDate;

    private LocalDate nextActionDate;

    @Size(max = 2000, message = "Notes must be at most 2000 characters")
    private String notes;

    @Size(max = 100, message = "CTC field must be at most 100 characters")
    private String ctcOffered;
}
