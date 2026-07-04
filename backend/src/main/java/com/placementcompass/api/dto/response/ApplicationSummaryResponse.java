package com.placementcompass.api.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * ApplicationSummaryResponse — aggregated counts per status, used by the Dashboard.
 *
 * The GET /api/applications/summary endpoint returns this single object.
 * The frontend Dashboard page uses these counts to populate the 5 metric cards.
 *
 * This replaces the hardcoded mock data in MetricCard on the frontend (Phase 4).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApplicationSummaryResponse {

    private long totalApplications;
    private long applied;
    private long oa;
    private long interview;
    private long offer;
    private long rejected;
    private long withdrawn;
}
