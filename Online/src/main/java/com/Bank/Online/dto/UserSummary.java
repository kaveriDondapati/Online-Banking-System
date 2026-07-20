package com.Bank.Online.dto;

import java.math.BigDecimal;

public record UserSummary(String userName, String accountNumber, BigDecimal balance) {
}