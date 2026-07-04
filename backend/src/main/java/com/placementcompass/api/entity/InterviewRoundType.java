package com.placementcompass.api.entity;

/**
 * InterviewRoundType — the category/format of an interview round.
 *
 * This enum drives the icon and colour displayed on the frontend timeline.
 * Adding a new type here is the only backend change needed to support new formats.
 */
public enum InterviewRoundType {
    RESUME_SHORTLIST,   // Initial screening / CV review
    ONLINE_ASSESSMENT,  // Coding test / HackerRank / LeetCode OJ
    APTITUDE_TEST,      // Quantitative / logical reasoning
    GROUP_DISCUSSION,   // GD round (common in Indian campus placements)
    TECHNICAL,          // Technical interview (DSA, CS fundamentals)
    SYSTEM_DESIGN,      // System design / HLD / LLD
    MANAGERIAL,         // Mid-level manager interview
    HR,                 // HR / culture-fit / offer negotiation
    OTHER               // Catch-all for non-standard rounds
}
