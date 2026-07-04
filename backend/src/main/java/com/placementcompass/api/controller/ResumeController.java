package com.placementcompass.api.controller;

import com.placementcompass.api.dto.response.ResumeResponse;
import com.placementcompass.api.security.UserDetailsImpl;
import com.placementcompass.api.service.ResumeService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

/**
 * ResumeController — REST endpoints for resume upload, retrieval, and management.
 *
 * Base URL: /api/resumes
 *
 * Endpoints:
 *   POST   /api/resumes                  → Upload a resume (multipart/form-data)
 *   GET    /api/resumes                  → List all resume metadata for the user
 *   GET    /api/resumes/{id}/download    → Stream file bytes for browser download
 *   PATCH  /api/resumes/{id}/active      → Mark resume as active
 *   DELETE /api/resumes/{id}             → Delete resume + GridFS bytes
 *
 * File upload design:
 *   The endpoint accepts "multipart/form-data" with two parts:
 *     - "file"  (required) — the actual PDF/DOCX bytes
 *     - "label" (optional) — user tag like "SDE Intern v2"
 *   This is the standard HTML5 form upload contract; Axios sends it the same way.
 *
 * Download design:
 *   Returns the file as an octet-stream with Content-Disposition: attachment,
 *   so the browser triggers a save dialog rather than trying to display inline.
 *   The filename comes from the Resume document's originalFilename.
 */
@RestController
@RequestMapping("/api/resumes")
@RequiredArgsConstructor
public class ResumeController {

    private final ResumeService resumeService;

    // ─────────────────────────────────────────────────────────────
    // POST /api/resumes  →  Upload
    // ─────────────────────────────────────────────────────────────

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ResumeResponse> upload(
            @AuthenticationPrincipal UserDetailsImpl currentUser,
            @RequestPart("file")                       MultipartFile file,
            @RequestParam(value = "label", required = false) String label) throws IOException {

        ResumeResponse response = resumeService.upload(currentUser.getId(), file, label);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // ─────────────────────────────────────────────────────────────
    // GET /api/resumes  →  List
    // ─────────────────────────────────────────────────────────────

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ResumeResponse>> listResumes(
            @AuthenticationPrincipal UserDetailsImpl currentUser) {

        return ResponseEntity.ok(resumeService.listResumes(currentUser.getId()));
    }

    // ─────────────────────────────────────────────────────────────
    // GET /api/resumes/{id}/download  →  Stream file
    // ─────────────────────────────────────────────────────────────

    @GetMapping("/{id}/download")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<InputStreamResource> download(
            @AuthenticationPrincipal UserDetailsImpl currentUser,
            @PathVariable String id) throws IOException {

        // Fetch metadata first to determine filename and content type
        List<ResumeResponse> metas = resumeService.listResumes(currentUser.getId());
        ResumeResponse meta = metas.stream()
                .filter(r -> r.getId().equals(id))
                .findFirst()
                .orElseThrow(() -> new com.placementcompass.api.exception.ResourceNotFoundException(
                        "Resume not found with id: " + id));

        InputStreamResource resource = resumeService.download(currentUser.getId(), id);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentDisposition(
                ContentDisposition.attachment()
                        .filename(meta.getOriginalFilename())
                        .build()
        );

        // Use the stored content type if available; fall back to octet-stream
        MediaType mediaType = (meta.getContentType() != null)
                ? MediaType.parseMediaType(meta.getContentType())
                : MediaType.APPLICATION_OCTET_STREAM;

        return ResponseEntity.ok()
                .headers(headers)
                .contentLength(meta.getSizeBytes())
                .contentType(mediaType)
                .body(resource);
    }

    // ─────────────────────────────────────────────────────────────
    // PATCH /api/resumes/{id}/active  →  Set active
    // ─────────────────────────────────────────────────────────────

    @PatchMapping("/{id}/active")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ResumeResponse> setActive(
            @AuthenticationPrincipal UserDetailsImpl currentUser,
            @PathVariable String id) {

        ResumeResponse response = resumeService.setActive(currentUser.getId(), id);
        return ResponseEntity.ok(response);
    }

    // ─────────────────────────────────────────────────────────────
    // DELETE /api/resumes/{id}  →  Delete
    // ─────────────────────────────────────────────────────────────

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal UserDetailsImpl currentUser,
            @PathVariable String id) {

        resumeService.delete(currentUser.getId(), id);
        return ResponseEntity.noContent().build();   // 204 No Content
    }
}
