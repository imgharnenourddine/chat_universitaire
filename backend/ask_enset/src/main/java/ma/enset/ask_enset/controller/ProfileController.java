package ma.enset.ask_enset.controller;

import lombok.RequiredArgsConstructor;
import ma.enset.ask_enset.dto.ChangePasswordRequest;
import ma.enset.ask_enset.dto.ProfileResponse;
import ma.enset.ask_enset.dto.UpdateProfileRequest;
import ma.enset.ask_enset.service.ProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class ProfileController {

    private final ProfileService profileService;

    // Récupère infos + stats
    @GetMapping
    public ResponseEntity<ProfileResponse> getProfile(
            Authentication authentication) {
        return ResponseEntity.ok(
                profileService.getProfile(authentication));
    }

    // Modifie nom/prénom
    @PutMapping
    public ResponseEntity<ProfileResponse> updateProfile(
            @RequestBody UpdateProfileRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(
                profileService.updateProfile(request, authentication));
    }

    // Change mot de passe
    @PutMapping("/password")
    public ResponseEntity<Void> changePassword(
            @RequestBody ChangePasswordRequest request,
            Authentication authentication) {
        profileService.changePassword(request, authentication);
        return ResponseEntity.ok().build();
    }

    // Upload photo de profil
    @PostMapping("/photo")
    public ResponseEntity<ProfileResponse> uploadPhoto(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {
        try {
            return ResponseEntity.ok(
                    profileService.uploadPhoto(file, authentication));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}