package com.Bank.Online.service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {

    private final String secret;
    private final long expirationMs;

    public JwtService(Environment env) {
        this.secret = firstNonBlank(
                System.getenv("JWT_SECRET"),
                System.getProperty("JWT_SECRET"),
                env.getProperty("JWT_SECRET"),
                env.getProperty("jwt.secret")
        );
        if (this.secret == null) {
            throw new IllegalStateException(
                    "JWT_SECRET is not set. Add it on the Render Web Service: Environment -> Add Environment Variable -> JWT_SECRET, then Manual Deploy."
            );
        }
        if (this.secret.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalStateException(
                    "JWT_SECRET must be at least 32 characters. Update it in Render Environment and redeploy."
            );
        }
        String expiration = firstNonBlank(
                System.getenv("JWT_EXPIRATION"),
                System.getProperty("JWT_EXPIRATION"),
                env.getProperty("JWT_EXPIRATION"),
                env.getProperty("jwt.expiration")
        );
        this.expirationMs = expiration == null ? 86400000L : Long.parseLong(expiration);
    }

    private static String firstNonBlank(String... values) {
        if (values == null) {
            return null;
        }
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value;
            }
        }
        return null;
    }

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(String id) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expirationMs);

        return Jwts.builder()
                .subject(id)
                .issuedAt(now)
                .expiration(expiry)
                .signWith(getSigningKey())
                .compact();
    }

    public String extractUserId(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    public boolean isTokenValid(String token) {
        try {
            Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public boolean validateToken(String token) {
        return isTokenValid(token);
    }

    public String extractUsername(String token) {
        return extractUserId(token);
    }
}
