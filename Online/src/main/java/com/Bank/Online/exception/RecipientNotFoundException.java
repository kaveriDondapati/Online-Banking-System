package com.Bank.Online.exception;

public class RecipientNotFoundException extends RuntimeException {
    public RecipientNotFoundException(String recipientId) {
        super("Recipient not found" +recipientId);
    }
}
