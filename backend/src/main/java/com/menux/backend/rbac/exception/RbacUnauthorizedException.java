package com.menux.backend.rbac.exception;

public class RbacUnauthorizedException extends RuntimeException {
    public RbacUnauthorizedException(String message) {
        super(message);
    }
}
