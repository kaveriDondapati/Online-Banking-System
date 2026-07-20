package com.Bank.Online.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record TransactionResponse(
        String type,
        BigDecimal amount,
        String counterpartyName,
        LocalDateTime createdAt
) {
}
