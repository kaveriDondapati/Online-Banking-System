package com.Bank.Online.controller;

import com.Bank.Online.dto.*;
import com.Bank.Online.model.Transactions;
import com.Bank.Online.service.AccountService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.apache.catalina.User;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AccountController {
    private final AccountService accountService;

    @PostMapping("/deposit")
    public ResponseEntity<String> deposit(@AuthenticationPrincipal String id, @RequestBody @Valid AmountRequest req) {
        accountService.deposit(id, req.amount());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/withdraw")
    public ResponseEntity<String> withdraw(@AuthenticationPrincipal String id, @RequestBody @Valid AmountRequest req) {
        accountService.withdraw(id, req.amount());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/transfer")
    public ResponseEntity<Transactions> transfer(@AuthenticationPrincipal String senderid, @RequestBody @Valid TransactionRequest req) {
        System.out.println("Transfer controller reached");
        accountService.transfer(senderid, req.recipientid(),req.amount());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/account")
    public ResponseEntity<AccountResponse> getAccount(@AuthenticationPrincipal String id) {
        return ResponseEntity.ok(accountService.getAccount(id));
    }

    @GetMapping("/transactions")
    public ResponseEntity<List<TransactionResponse>> getTransactions(@AuthenticationPrincipal String id) {
        return ResponseEntity.ok(accountService.getTransactions(id));
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserSummary>> getOtherUsers(@AuthenticationPrincipal String id){
        return ResponseEntity.ok(accountService.getOtherUsers(id));
    }

    @GetMapping("/test")
    public String test(Authentication authentication) {

        System.out.println(authentication.getPrincipal());

        return "ok";

    }
}
