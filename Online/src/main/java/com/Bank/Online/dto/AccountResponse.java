package com.Bank.Online.dto;

import java.math.BigDecimal;

public record AccountResponse(
        String userName,
        String accountNumber,
        BigDecimal balance
) {
}
