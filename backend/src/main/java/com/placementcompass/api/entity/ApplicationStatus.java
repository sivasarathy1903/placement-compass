package com.placementcompass.api.entity;

/**
 * ApplicationStatus — lifecycle stages of a placement application.
 *
 * Why String storage in MongoDB?
 * MongoDB stores enums as their .name() string by default when Jackson serialises them.
 * This means the database contains readable values like "APPLIED" instead of 0, 1, 2...
 * Making queries, aggregations, and debugging far easier.
 *
 * Status transition flow (typical):
 *   APPLIED → OA → INTERVIEW → OFFER
 *                           └→ REJECTED
 *   Any stage → WITHDRAWN  (student withdraws application)
 */
public enum ApplicationStatus {
    APPLIED,
    OA,          // Online Assessment / Coding Test
    INTERVIEW,
    OFFER,
    REJECTED,
    WITHDRAWN
}
