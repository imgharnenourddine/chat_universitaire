package ma.enset.ask_enset.controller;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import ma.enset.ask_enset.dto.ChangePasswordRequest;
import ma.enset.ask_enset.dto.ProfileResponse;
import ma.enset.ask_enset.dto.UpdateProfileRequest;
import ma.enset.ask_enset.service.ProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpServletRequest;

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
    // Sert la photo depuis MinIO
@GetMapping("/photo/**")
public ResponseEntity<byte[]> getPhoto(
        HttpServletRequest request) throws Exception {

    // Extrait le nom du fichier depuis l'URL
    // ex: /api/profile/photo/profiles/1_photo.jpg
    //     → fileName = profiles/1_photo.jpg
    String fileName = request.getRequestURI()
            .split("/api/profile/photo/")[1];

    byte[] photo = profileService.getPhoto(fileName);

    return ResponseEntity.ok()
            .header("Content-Type", "image/jpeg")
            .body(photo);
}
}