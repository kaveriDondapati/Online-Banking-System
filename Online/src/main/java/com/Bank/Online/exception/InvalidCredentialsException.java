package com.Bank.Online.exception;

public class InvalidCredentialsException extends RuntimeException {
    public InvalidCredentialsException() {
        super("Invalid User ID or PIN");
    }
}
