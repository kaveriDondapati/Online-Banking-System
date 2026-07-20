package com.Bank.Online.dto;

public record LoginResponse(
        String token,
        String userName,
        String accountNumber
) {
}
