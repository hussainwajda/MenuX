package com.menux.backend.rbac.exception;

public class RbacAccessDeniedException extends RuntimeException {
    public RbacAccessDeniedException(String message) {
        super(message);
    }
}
