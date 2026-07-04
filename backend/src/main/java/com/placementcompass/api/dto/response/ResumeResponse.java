package com.placementcompass.api.dto.response;

import com.placementcompass.api.entity.Resume;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * ResumeResponse — public-facing metadata shape for a stored resume.
 *
 * The gridFsId is intentionally NOT included — the client never needs the
 * raw ObjectId. All operations (download, delete, set-active) reference
 * the Resume document's own `id`, not the underlying GridFS id.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResumeResponse {

    /** Stable MongoDB document ID — used by all client-side operations. */
    private String id;

    /** Original filename as uploaded (e.g. "resume_v3.pdf"). */
    private String originalFilename;

    /**
     * User-defined label (e.g. "SDE Intern — Summer 2025").
     * Falls back to originalFilename if the user did not supply one.
     */
    private String label;

    /** MIME type: "application/pdf" or Word MIME. */
    private String contentType;

    /** File size in bytes — formatted for display by the frontend. */
    private long sizeBytes;

    /** Whether this is the user's currently active / primary resume. */
    private boolean isActive;

    /** When this version was uploaded. */
    private Instant createdAt;

    /**
     * Static factory: maps a Resume entity to this response DTO.
     * Applies the label fallback (uses filename if label is blank).
     */
    public static ResumeResponse from(Resume resume) {
        String displayLabel = (resume.getLabel() != null && !resume.getLabel().isBlank())
                ? resume.getLabel()
                : resume.getOriginalFilename();

        return ResumeResponse.builder()
                .id(resume.getId())
                .originalFilename(resume.getOriginalFilename())
                .label(displayLabel)
                .contentType(resume.getContentType())
                .sizeBytes(resume.getSizeBytes())
                .isActive(resume.isActive())
                .createdAt(resume.getCreatedAt())
                .build();
    }
}
