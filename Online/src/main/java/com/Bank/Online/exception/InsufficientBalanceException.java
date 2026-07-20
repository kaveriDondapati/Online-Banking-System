package com.Bank.Online.exception;

import lombok.Getter;

import java.math.BigDecimal;

@Getter
    public class InsufficientBalanceException extends RuntimeException {


        private final BigDecimal balance;

        public InsufficientBalanceException(BigDecimal balance) {
            super("Insufficient balance. Available balance: " + balance);
            this.balance = balance;
        }


    }
