package com.Bank.Online.exception;

public class UserIdAlreadyExistsException extends RuntimeException {
    public UserIdAlreadyExistsException(String message) {
        super("User ID already taken: " );
    }

}
