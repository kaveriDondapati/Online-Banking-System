package com.Bank.Online.service;

import com.Bank.Online.dto.*;
import com.Bank.Online.exception.InsufficientBalanceException;
import com.Bank.Online.exception.InvalidCredentialsException;
import com.Bank.Online.exception.RecipientNotFoundException;
import com.Bank.Online.exception.UserIdAlreadyExistsException;
import com.Bank.Online.model.Transactions;
import com.Bank.Online.model.users;
import com.Bank.Online.repository.TransactionRepository;
import com.Bank.Online.repository.userRepository;
import lombok.RequiredArgsConstructor;
import org.apache.catalina.User;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.Bank.Online.service.JwtService;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AccountService {
    private final userRepository userRepo;
    private final TransactionRepository transactionRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Transactional
    public void deposit(String id, BigDecimal amount) {
        users user = userRepo.findById(Integer.parseInt(id)).orElseThrow();
        user.setBalance(user.getBalance().add(amount));
        Transactions t = new Transactions();
        t.setUser(user);
        t.setType("Deposit");
        t.setAmount(amount);
        t.setCounterpartyName(null);
        t.setCreatedAt(LocalDateTime.now());

        transactionRepo.save(t);
    }

    @Transactional
    public void withdraw(String id, BigDecimal amount) {
        users user = userRepo.findById(Integer.parseInt(id)).orElseThrow();
        if (amount.compareTo(user.getBalance()) > 0) {
            throw new InsufficientBalanceException(user.getBalance());
        }
        user.setBalance(user.getBalance().subtract(amount));
        transactionRepo.save(new Transactions(null, user, "Withdrawal", amount, null, LocalDateTime.now()));
    }

    @Transactional
    public void transfer(String senderid, String recipientid, BigDecimal amount) {
        users sender = userRepo.findById(Integer.parseInt(senderid)).orElseThrow();
        users recipient = userRepo.findByAccountNumber(recipientid).orElseThrow(() -> new RecipientNotFoundException(recipientid));

        if (amount.compareTo(sender.getBalance()) > 0) {
            throw new InsufficientBalanceException(sender.getBalance());
        }
        sender.setBalance(sender.getBalance().subtract(amount));
        recipient.setBalance(recipient.getBalance().add(amount));

        transactionRepo.save(new Transactions(null, sender, "Transfer to" + recipient.getUserName(), amount, recipient.getUserName(), LocalDateTime.now()));
        transactionRepo.save(new Transactions(null, recipient, "Received from" + sender.getUserName(), amount, sender.getUserName(), LocalDateTime.now()));

    }

    public AccountResponse getAccount(String id) {
        users user = userRepo.findById(Integer.valueOf(id)).orElseThrow(InvalidCredentialsException::new);
        return new AccountResponse(user.getUserName(), user.getAccountNumber(), user.getBalance());
    }

    public List<TransactionResponse> getTransactions(String id) {
        users user = userRepo.findById(Integer.parseInt(id)).orElseThrow(InvalidCredentialsException::new);
        List<Transactions> transactions = transactionRepo.findByUserOrderByCreatedAtDesc(user);
        return transactions.stream()
                .map(t -> new TransactionResponse(t.getType(), t.getAmount(), t.getCounterpartyName(), t.getCreatedAt()))
                .toList();
    }

    public List<UserSummary> getOtherUsers(String currentUsername) {
        return userRepo.findAll().stream()
                .filter(u -> !u.getUserName().equals(currentUsername))
                .map(u -> new UserSummary(u.getUserName(), u.getAccountNumber(), u.getBalance()))
                .toList();
    }

    public RegisterResponse register(String userName, String password, String confirmPassword) {
        System.out.println("Username = " + userName);
        System.out.println("Password = " + password);
        System.out.println("Confirm Password = " + confirmPassword);

        if (!password.equals(confirmPassword)) {
            throw new IllegalArgumentException("Password do not match");
        }
        if (userRepo.findByUserName(userName).isPresent()) {
            throw new UserIdAlreadyExistsException("Username already exists");
        }


        users user = new users();
        user.setUserName(userName);
        user.setPassword(passwordEncoder.encode(password));
        user.setConfirmPassword(passwordEncoder.encode(confirmPassword));
        user.setAccountNumber(generateAccountNumber());
        user.setBalance(BigDecimal.ZERO);

        userRepo.save(user);
        return new RegisterResponse(user.getUserName(),
                user.getPassword(), user.getConfirmPassword());
    }

    public LoginResponse login(String userName, String password) {
        users user = userRepo.findByUserName(userName)
                .orElseThrow(InvalidCredentialsException::new);
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new InvalidCredentialsException();
        }

        String token = jwtService.generateToken(String.valueOf(user.getId()));
        return new LoginResponse(token, user.getUserName(), user.getAccountNumber());
    }

    private String generateAccountNumber() {
        long number = 1000000000L + (long) (Math.random() * 8999999999L);
        return String.valueOf(number);
    }
}


