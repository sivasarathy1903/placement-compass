package com.placementcompass.api.repository;

import com.placementcompass.api.entity.Resume;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * ResumeRepository — Spring Data MongoDB repository for Resume metadata.
 *
 * All query methods automatically append the userId filter, ensuring
 * data isolation between users at the repository layer (in addition to
 * the ownership checks in the service layer).
 */
@Repository
public interface ResumeRepository extends MongoRepository<Resume, String> {

    /**
     * Returns all resumes for a user, newest upload first.
     * Used to populate the version history list on the frontend.
     */
    List<Resume> findByUserIdOrderByCreatedAtDesc(String userId);

    /**
     * Returns the user's currently active resume (if any).
     * Result is Optional because no resume may be active yet.
     */
    Optional<Resume> findByUserIdAndIsActiveTrue(String userId);

    /**
     * Total resume count for a user — used to enforce an optional upload limit.
     */
    long countByUserId(String userId);
}
