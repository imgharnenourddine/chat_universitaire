package ma.enset.ask_enset.security;


import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private Long expiration;

    // Générer un token
    public String generateToken(String email) {
        return Jwts.builder()
                .subject(email)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getKey())
                .compact();
    }

    // Extraire l'email depuis le token
    public String extractEmail(String token) {
        return getClaims(token).getSubject();
    }

    // Vérifier si le token est valide
    public boolean isTokenValid(String token) {
        try {
            return !getClaims(token)
                    .getExpiration()
                    .before(new Date());
        } catch (Exception e) {
            return false;
        }
    }

    // Méthodes privées
    private Claims getClaims(String token) {
        return Jwts.parser()
                .verifyWith((javax.crypto.SecretKey) getKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private Key getKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }
}