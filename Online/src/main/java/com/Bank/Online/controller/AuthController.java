package com.Bank.Online.controller;

import com.Bank.Online.dto.LoginRequest;
import com.Bank.Online.dto.LoginResponse;
import com.Bank.Online.dto.RegisterRequest;
import com.Bank.Online.dto.RegisterResponse;
import com.Bank.Online.service.AccountService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AccountService accountService;

    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(@RequestBody @Valid RegisterRequest req) {
        return ResponseEntity.ok(accountService.register(req.userName(), req.password(), req.confirmPassword()));
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody @Valid LoginRequest req) {
        return ResponseEntity.ok(accountService.login(req.userName(), req.password()));
    }
}
