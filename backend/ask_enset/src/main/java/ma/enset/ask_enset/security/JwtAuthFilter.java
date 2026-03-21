package ma.enset.ask_enset.security;


import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        // 1. Récupère le header Authorization
        String authHeader = request.getHeader("Authorization");

        // 2. Pas de token → passe à la suite
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // 3. Extrait le token (enlève "Bearer ")
        String token = authHeader.substring(7);

        // 4. Extrait l'email depuis le token
        String email = jwtService.extractEmail(token);

        // 5. Vérifie si user pas encore authentifié
        if (email != null && SecurityContextHolder
                .getContext()
                .getAuthentication() == null) {

            // 6. Charge le user depuis la DB
            UserDetails userDetails = userDetailsService
                    .loadUserByUsername(email);

            // 7. Token valide → authentifie le user
            if (jwtService.isTokenValid(token)) {
                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities()
                        );
                authToken.setDetails(
                        new WebAuthenticationDetailsSource()
                                .buildDetails(request)
                );
                SecurityContextHolder.getContext()
                        .setAuthentication(authToken);
            }
        }

        // 8. Continue vers la route demandée
        filterChain.doFilter(request, response);
    }
}