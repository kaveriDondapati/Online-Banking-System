package com.Bank.Online.repository;

import com.Bank.Online.model.users;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface userRepository extends JpaRepository<users, Integer> {
    Optional<users> findByUserName(String userName);

    Optional<users> findByAccountNumber(String accountNumber);
}
