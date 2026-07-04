package com.placementcompass.api.service;

import com.mongodb.client.gridfs.model.GridFSFile;
import com.placementcompass.api.dto.response.ResumeResponse;
import com.placementcompass.api.entity.Resume;
import com.placementcompass.api.exception.ResourceNotFoundException;
import com.placementcompass.api.repository.ResumeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.bson.types.ObjectId;
import org.springframework.core.io.InputStreamResource;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.gridfs.GridFsOperations;
import org.springframework.data.mongodb.gridfs.GridFsTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

/**
 * ResumeService — business logic for GridFS-backed resume management.
 *
 * GridFS interaction:
 * - GridFsTemplate.store()       → writes file bytes + produces an ObjectId
 * - GridFsTemplate.findOne()     → locates a GridFS file descriptor by ObjectId
 * - GridFsOperations.getResource() → opens an InputStream over the GridFS chunks
 * - GridFsTemplate.delete()      → removes fs.files + fs.chunks entries
 *
 * Why both GridFsTemplate and GridFsOperations?
 * Spring Data MongoDB exposes two beans:
 *   • GridFsTemplate        — store, find, delete (query-level)
 *   • GridFsOperations      — getResource (streaming)
 * They are both auto-configured; injecting both gives us full coverage.
 *
 * Ownership:
 * Every mutating method calls findAndVerifyOwnership() — same pattern as
 * JobApplicationService — ensuring users can only touch their own files.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ResumeService {

    private final ResumeRepository resumeRepository;
    private final GridFsTemplate    gridFsTemplate;
    private final GridFsOperations  gridFsOperations;

    // ─────────────────────────────────────────────────────────────
    // UPLOAD
    // ─────────────────────────────────────────────────────────────

    /**
     * Stores the file in GridFS, then saves a Resume metadata document.
     *
     * @param userId  JWT-sourced owner id.
     * @param file    MultipartFile from the HTTP request.
     * @param label   Optional user-supplied tag for this version.
     * @return        Saved resume metadata as a response DTO.
     */
    public ResumeResponse upload(String userId, MultipartFile file, String label) throws IOException {

        // 1. Write bytes to GridFS; receive the new ObjectId
        ObjectId gridFsObjectId = gridFsTemplate.store(
                file.getInputStream(),
                file.getOriginalFilename(),
                file.getContentType()
        );

        // 2. Persist metadata document in the "resumes" collection
        Resume resume = Resume.builder()
                .userId(userId)
                .gridFsId(gridFsObjectId.toHexString())
                .originalFilename(file.getOriginalFilename())
                .label(label)
                .contentType(file.getContentType())
                .sizeBytes(file.getSize())
                .isActive(false)   // user must explicitly mark active
                .build();

        Resume saved = resumeRepository.save(resume);
        log.info("User [{}] uploaded resume [{}] ({} bytes)", userId, saved.getId(), saved.getSizeBytes());
        return ResumeResponse.from(saved);
    }

    // ─────────────────────────────────────────────────────────────
    // LIST
    // ─────────────────────────────────────────────────────────────

    /**
     * Returns all resumes for the user, newest first.
     */
    public List<ResumeResponse> listResumes(String userId) {
        return resumeRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(ResumeResponse::from)
                .collect(Collectors.toList());
    }

    // ─────────────────────────────────────────────────────────────
    // DOWNLOAD
    // ─────────────────────────────────────────────────────────────

    /**
     * Opens an InputStream over the GridFS file chunks for streaming.
     *
     * @return InputStreamResource — Spring's lazy wrapper; the controller
     *         sets Content-Disposition so the browser triggers a download.
     */
    public InputStreamResource download(String userId, String resumeId) throws IOException {
        Resume resume = findAndVerifyOwnership(userId, resumeId);

        GridFSFile gridFsFile = gridFsTemplate.findOne(
                new Query(Criteria.where("_id").is(new ObjectId(resume.getGridFsId())))
        );

        if (gridFsFile == null) {
            throw new ResourceNotFoundException("File not found in storage for resume id: " + resumeId);
        }

        return new InputStreamResource(gridFsOperations.getResource(gridFsFile).getInputStream());
    }

    // ─────────────────────────────────────────────────────────────
    // SET ACTIVE
    // ─────────────────────────────────────────────────────────────

    /**
     * Marks the given resume as the user's active version.
     *
     * Strategy: load all user resumes → clear isActive on all → set on target → save in bulk.
     * This keeps a consistent "at most one active" invariant without a separate DB transaction.
     */
    public ResumeResponse setActive(String userId, String resumeId) {
        // Verify ownership first
        Resume target = findAndVerifyOwnership(userId, resumeId);

        // Clear active flag on all user resumes (including target)
        List<Resume> allResumes = resumeRepository.findByUserIdOrderByCreatedAtDesc(userId);
        allResumes.forEach(r -> r.setActive(false));
        resumeRepository.saveAll(allResumes);

        // Now set active on the target
        target.setActive(true);
        Resume updated = resumeRepository.save(target);

        log.info("User [{}] set resume [{}] as active", userId, resumeId);
        return ResumeResponse.from(updated);
    }

    // ─────────────────────────────────────────────────────────────
    // DELETE
    // ─────────────────────────────────────────────────────────────

    /**
     * Deletes the GridFS file (bytes + chunks) and the metadata document.
     * Order matters: delete GridFS first; if the metadata delete fails,
     * a stale metadata row is harmless (no dangling bytes orphan storage).
     */
    public void delete(String userId, String resumeId) {
        Resume resume = findAndVerifyOwnership(userId, resumeId);

        // Remove file from GridFS
        gridFsTemplate.delete(
                new Query(Criteria.where("_id").is(new ObjectId(resume.getGridFsId())))
        );

        // Remove metadata document
        resumeRepository.delete(resume);
        log.info("User [{}] deleted resume [{}]", userId, resumeId);
    }

    // ─────────────────────────────────────────────────────────────
    // PRIVATE HELPERS
    // ─────────────────────────────────────────────────────────────

    /**
     * Fetches a Resume by id and verifies the requesting user owns it.
     * Returns 404 for both "not found" and "wrong owner" to prevent enumeration.
     */
    private Resume findAndVerifyOwnership(String userId, String resumeId) {
        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Resume not found with id: " + resumeId));

        if (!resume.getUserId().equals(userId)) {
            log.warn("User [{}] attempted to access resume [{}] owned by [{}]",
                    userId, resumeId, resume.getUserId());
            throw new ResourceNotFoundException("Resume not found with id: " + resumeId);
        }

        return resume;
    }
}
