package com.Bank.Online.dto;

import java.math.BigDecimal;

public record AccountResponse(

        String UserName,

        String accountNumber,
        BigDecimal balance

) {

}
