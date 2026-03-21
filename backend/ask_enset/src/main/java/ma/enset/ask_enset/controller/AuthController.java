package ma.enset.ask_enset.controller;

import lombok.RequiredArgsConstructor;
import ma.enset.ask_enset.dto.AuthResponse;
import ma.enset.ask_enset.dto.LoginRequest;
import ma.enset.ask_enset.dto.RegisterRequest;
import ma.enset.ask_enset.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }
}