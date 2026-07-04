package com.placementcompass.api.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * ResourceNotFoundException — thrown when a requested resource does not exist
 * or when a user attempts to access a resource they do not own.
 *
 * Why use @ResponseStatus?
 * Spring MVC reads this annotation and automatically sets the HTTP status to 404
 * when this exception propagates out of a controller, even without a custom
 * @ExceptionHandler (though we also add one in GlobalExceptionHandler for
 * consistent JSON error body formatting).
 *
 * Why is "not found" and "not authorized to access" the same exception?
 * Security best practice: returning 403 (Forbidden) tells an attacker that
 * a resource *exists* but they can't access it. Returning 404 reveals nothing.
 * This is the same approach used by GitHub's private repo API.
 */
@ResponseStatus(HttpStatus.NOT_FOUND)
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }
}
