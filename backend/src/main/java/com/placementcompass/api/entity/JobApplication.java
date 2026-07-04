package com.placementcompass.api.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;


/**
 * JobApplication — the core domain entity of Placement Compass.
 *
 * MongoDB Collection: "applications"
 *
 * Design Notes:
 * ---
 * 1. userId (indexed):
 *    Every document stores the owner's User ID. All queries must include
 *    { userId: <currentUser> } as a filter to enforce data isolation.
 *    The @Indexed annotation creates a MongoDB index on this field for fast lookups.
 *
 * 2. CompoundIndex on (userId, status):
 *    The most common query pattern is "all applications for user X with status Y"
 *    (used by both the list endpoint and the /summary aggregate). A compound index
 *    covers this query in O(log n) without a full collection scan.
 *
 * 3. applicationDate vs. createdAt:
 *    - applicationDate: the real-world date the student submitted the application.
 *      Managed by the student; can be backdated.
 *    - createdAt: the database audit timestamp — when this record was saved.
 *    These are intentionally different fields.
 *
 * 4. notes:
 *    A freeform text field for private notes (recruiter contact info, prep notes, etc.).
 *    Max 2000 chars enforced at the DTO validation layer.
 *
 * 5. jobUrl:
 *    The direct link to the job posting. Essential for multi-platform tracking.
 */
@Document(collection = "applications")
@CompoundIndex(name = "userId_status_idx", def = "{'userId': 1, 'status': 1}")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobApplication {

    @Id
    private String id;

    /** Owner: links this application to a User document. Never exposed to other users. */
    @Indexed
    private String userId;

    /** Company name, e.g. "Google", "Infosys" */
    private String companyName;

    /** Job title / role, e.g. "Software Engineer Intern" */
    private String role;

    /** Career portal / LinkedIn / referral link */
    private String jobUrl;

    /** Application lifecycle stage */
    private ApplicationStatus status;

    /** Where the student found the opportunity */
    private String source;  // e.g. "LinkedIn", "Campus Portal", "Referral", "Company Website"

    /** The date the student submitted their application */
    private LocalDate applicationDate;

    /** Next important date: deadline, OA date, interview schedule */
    private LocalDate nextActionDate;

    /** Private notes (prep reminders, recruiter contact, etc.) */
    private String notes;

    /** Package offered (filled in when status = OFFER) */
    private String ctcOffered;

    /**
     * Embedded interview rounds for this application.
     * Initialised as an empty ArrayList so the field is never null —
     * this prevents NullPointerExceptions when adding the first round.
     */
    private List<InterviewRound> rounds = new ArrayList<>();


    // ── Audit fields (populated by Spring Data MongoDB Auditing) ──
    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}
