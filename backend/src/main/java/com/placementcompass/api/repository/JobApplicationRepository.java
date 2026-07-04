package com.placementcompass.api.repository;

import com.placementcompass.api.entity.ApplicationStatus;
import com.placementcompass.api.entity.JobApplication;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

/**
 * JobApplicationRepository — Spring Data MongoDB repository.
 *
 * Spring Data auto-generates the implementation for all these methods at runtime
 * by parsing the method names using its "query derivation" engine.
 * No SQL or MongoDB query strings needed.
 *
 * Method naming conventions:
 *   findBy<Field>          → WHERE field = ?
 *   findBy<Field>And<Field>→ WHERE field1 = ? AND field2 = ?
 *   countBy<Field>         → COUNT WHERE field = ?
 *   existsBy<Field>        → EXISTS WHERE field = ?
 *   deleteBy<Field>        → DELETE WHERE field = ?
 */
@Repository
public interface JobApplicationRepository extends MongoRepository<JobApplication, String> {

    /**
     * Paginated list of all applications for a user.
     * Used by: GET /api/applications?page=0&size=10
     */
    Page<JobApplication> findByUserId(String userId, Pageable pageable);

    /**
     * Paginated list filtered by status.
     * Used by: GET /api/applications?status=INTERVIEW&page=0&size=10
     */
    Page<JobApplication> findByUserIdAndStatus(String userId, ApplicationStatus status, Pageable pageable);

    /**
     * Count of applications in a given status for a user.
     * Used by: GET /api/applications/summary (called once per status)
     */
    long countByUserIdAndStatus(String userId, ApplicationStatus status);

    /**
     * Total count for a user (all statuses).
     * Used by: GET /api/applications/summary
     */
    long countByUserId(String userId);
}
