package com.placementcompass.api.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

/**
 * Resume — metadata document for a stored resume file.
 *
 * MongoDB Collection: "resumes"
 *
 * Design notes:
 * ---
 * 1. File bytes are NOT stored here.
 *    Actual file content is stored in MongoDB GridFS (fs.files + fs.chunks).
 *    This document only holds the metadata + the GridFS ObjectId reference.
 *
 * 2. gridFsId:
 *    The ObjectId string returned by GridFsTemplate.store().
 *    Used to retrieve or delete the file from GridFS.
 *
 * 3. isActive:
 *    Only one resume per user should be marked active at a time.
 *    Enforced in ResumeService.setActive() by bulk-clearing then setting.
 *
 * 4. label:
 *    A short user-defined tag, e.g. "SDE v2 — June 2025".
 *    Falls back to originalFilename in the UI if empty.
 *
 * 5. userId index:
 *    Every query includes `{ userId: <current> }` — the index ensures
 *    O(log n) lookups across potentially many user documents.
 */
@Document(collection = "resumes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Resume {

    @Id
    private String id;

    /** Owner — links this metadata to a User. */
    @Indexed
    private String userId;

    /**
     * GridFS ObjectId (as a hex string) pointing to the actual file bytes.
     * Stored as a String to avoid bson ObjectId dependency in the DTO layer.
     */
    private String gridFsId;

    /** Original filename as provided by the browser (e.g. "resume_v3.pdf"). */
    private String originalFilename;

    /**
     * User-defined tag for this version.
     * Nullable — the service falls back to originalFilename in the response if blank.
     */
    private String label;

    /** MIME type: "application/pdf" or Word MIME types. */
    private String contentType;

    /** File size in bytes — displayed in the UI card. */
    private long sizeBytes;

    /**
     * True for the resume the user has designated as their current / primary version.
     * At most one document per userId should have isActive = true.
     */
    private boolean isActive;

    /** Audit timestamp — auto-populated by Spring Data auditing. */
    @CreatedDate
    private Instant createdAt;
}
