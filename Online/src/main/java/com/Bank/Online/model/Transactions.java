package com.Bank.Online.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name= "transactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Transactions {

    @Id  @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name="user_id",insertable=false,updatable=false)
    private users user;

    private String type;

    private BigDecimal amount;

    private String counterpartyName;

    private LocalDateTime createdAt;
}
