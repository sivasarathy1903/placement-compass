package com.placementcompass.api.entity;

/**
 * InterviewRoundOutcome — the result of a completed interview round.
 */
public enum InterviewRoundOutcome {
    PENDING,    // Round scheduled but not yet taken / decision not received
    PASSED,     // Cleared to the next round
    FAILED,     // Did not progress further
    ON_HOLD     // Company deferred decision (waitlisted, background check, etc.)
}
