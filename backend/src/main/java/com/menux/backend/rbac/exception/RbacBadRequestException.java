package com.menux.backend.rbac.exception;

public class RbacBadRequestException extends RuntimeException {
    public RbacBadRequestException(String message) {
        super(message);
    }
}
