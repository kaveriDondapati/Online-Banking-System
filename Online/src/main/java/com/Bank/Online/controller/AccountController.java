package com.Bank.Online.controller;

import com.Bank.Online.dto.*;
import com.Bank.Online.service.AccountService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AccountController {
    private final AccountService accountService;

    @PostMapping("/deposit")
    public ResponseEntity<Void> deposit(@AuthenticationPrincipal String id, @RequestBody @Valid AmountRequest req) {
        accountService.deposit(id, req.amount());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/withdraw")
    public ResponseEntity<Void> withdraw(@AuthenticationPrincipal String id, @RequestBody @Valid AmountRequest req) {
        accountService.withdraw(id, req.amount());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/transfer")
    public ResponseEntity<Void> transfer(@AuthenticationPrincipal String senderid, @RequestBody @Valid TransactionRequest req) {
        accountService.transfer(senderid, req.recipientid(), req.amount());
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
    public ResponseEntity<List<UserSummary>> getOtherUsers(@AuthenticationPrincipal String id) {
        return ResponseEntity.ok(accountService.getOtherUsers(id));
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("ok");
    }
}
