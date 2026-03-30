package ma.enset.ask_enset.service;

import lombok.RequiredArgsConstructor;
import ma.enset.ask_enset.dto.AuthResponse;
import ma.enset.ask_enset.dto.LoginRequest;
import ma.enset.ask_enset.dto.RegisterRequest;
import ma.enset.ask_enset.model.User;
import ma.enset.ask_enset.repository.UserRepository;
import ma.enset.ask_enset.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    // Login
    public AuthResponse login(LoginRequest request) {

        // 1. Vérifier email + password
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        // 2. Charger le user depuis PostgreSQL
        User user = userRepository
                .findByEmail(request.getEmail())
                .orElseThrow();

        // 3. Générer token JWT
        String token = jwtService.generateToken(user.getEmail());

        // 4. Retourner la réponse
        return new AuthResponse(
                token,
                user.getNom(),
                user.getPrenom(),
                user.getEmail(),
                user.getRole().name(),
                user.getImagePath()
        );
    }

    // Register
    public AuthResponse register(RegisterRequest request) {

        // 1. Vérifier si email déjà utilisé
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email déjà utilisé !");
        }

        // 2. Créer le user
        User user = new User();
        user.setNom(request.getNom());
        user.setPrenom(request.getPrenom());
        user.setEmail(request.getEmail());
        user.setPassword(
                passwordEncoder.encode(request.getPassword())
        );
        user.setRole(User.Role.ADMIN);

        // 3. Sauvegarder dans PostgreSQL
        userRepository.save(user);

        // 4. Générer token JWT
        String token = jwtService.generateToken(user.getEmail());

        // 5. Retourner la réponse
        return new AuthResponse(
                token,
                user.getNom(),
                user.getPrenom(),
                user.getEmail(),
                user.getRole().name(),
                user.getImagePath()
        );
    }
}