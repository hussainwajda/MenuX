package com.menux.backend.rbac.exception;

public class RbacNotFoundException extends RuntimeException {
    public RbacNotFoundException(String message) {
        super(message);
    }
}
