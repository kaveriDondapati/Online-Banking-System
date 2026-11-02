package com.Bank.Online.repository;

import com.Bank.Online.model.Transactions;
import com.Bank.Online.model.users;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TransactionRepository extends JpaRepository<Transactions, Long> {
    List<Transactions> findByUserOrderByCreatedAtDesc(users user);
}
