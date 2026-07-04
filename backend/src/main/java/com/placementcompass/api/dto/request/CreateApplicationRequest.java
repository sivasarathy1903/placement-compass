package com.placementcompass.api.dto.request;

import com.placementcompass.api.entity.ApplicationStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

/**
 * CreateApplicationRequest — the validated request body for POST /api/applications.
 *
 * Why separate from the entity?
 * The client should NEVER send internal fields like userId, createdAt, or updatedAt.
 * The DTO defines exactly what the client is allowed to supply. The service layer
 * maps this DTO to a JobApplication entity and stamps the userId from the JWT.
 *
 * Validation annotations:
 * - @NotBlank: rejects null, empty strings, and whitespace-only strings.
 * - @NotNull: rejects null but allows other values (used for enums and dates).
 * - @Size: enforces length constraints that the database doesn't enforce.
 */
@Data
public class CreateApplicationRequest {

    @NotBlank(message = "Company name is required")
    @Size(max = 150, message = "Company name must be at most 150 characters")
    private String companyName;

    @NotBlank(message = "Role/job title is required")
    @Size(max = 200, message = "Role must be at most 200 characters")
    private String role;

    @Size(max = 500, message = "Job URL must be at most 500 characters")
    private String jobUrl;

    @NotNull(message = "Status is required")
    private ApplicationStatus status;

    @Size(max = 100, message = "Source must be at most 100 characters")
    private String source;

    @NotNull(message = "Application date is required")
    private LocalDate applicationDate;

    private LocalDate nextActionDate;

    @Size(max = 2000, message = "Notes must be at most 2000 characters")
    private String notes;

    @Size(max = 100, message = "CTC field must be at most 100 characters")
    private String ctcOffered;
}
