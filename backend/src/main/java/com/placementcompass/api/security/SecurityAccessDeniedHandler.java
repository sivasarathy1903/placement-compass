package com.placementcompass.api.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

/**
 * SecurityAccessDeniedHandler — writes a structured JSON 403 Forbidden response
 * for authenticated users who attempt to access resources they are not authorized for.
 *
 * Why this is needed:
 * - AuthenticationEntryPoint (AuthEntryPointJwt) handles 401 UNAUTHENTICATED requests
 *   (no token, or invalid token).
 * - AccessDeniedHandler handles 403 AUTHENTICATED-BUT-NOT-AUTHORIZED requests
 *   (valid token, but wrong role for the endpoint).
 *
 * Without this, Spring Security falls back to its default redirect-based handler
 * which is inappropriate for a stateless REST API. Combined with the catch-all
 * GlobalExceptionHandler, the result was HTTP 500 instead of HTTP 403.
 */
@Component
@Slf4j
public class SecurityAccessDeniedHandler implements AccessDeniedHandler {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void handle(
            HttpServletRequest request,
            HttpServletResponse response,
            AccessDeniedException accessDeniedException) throws IOException, ServletException {

        log.warn("Access Denied [{}] {}: {}", request.getMethod(), request.getServletPath(),
                accessDeniedException.getMessage());

        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);

        final Map<String, Object> body = new HashMap<>();
        body.put("status", HttpServletResponse.SC_FORBIDDEN);
        body.put("error", "Forbidden");
        body.put("message", "You do not have permission to access this resource.");
        body.put("path", request.getServletPath());

        objectMapper.writeValue(response.getOutputStream(), body);
    }
}
