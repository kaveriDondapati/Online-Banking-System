package com.Bank.Online.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Entity
@Table(name="users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class users {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(unique = true, nullable = false)
    private String userName;

    @Column(nullable = false)
    private String password;


    @Column(nullable = false)
    private String confirmPassword;

    @Column(unique = true, nullable = false)
    private String accountNumber;

    @Column
    private BigDecimal balance;

    @OneToMany(mappedBy ="user", cascade = CascadeType.ALL)
    private List<Transactions> transactions;

}
