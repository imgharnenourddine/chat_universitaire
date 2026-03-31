package ma.enset.ask_enset.controller;

import lombok.RequiredArgsConstructor;
import ma.enset.ask_enset.model.Document_enset;
import ma.enset.ask_enset.model.User;
import ma.enset.ask_enset.repository.UserRepository;
import ma.enset.ask_enset.service.DocumentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
// ✅ après
@CrossOrigin(origins = "http://localhost:5173")
public class DocumentController {

    private final DocumentService documentService;
    private final UserRepository userRepository;

    // Upload PDF
    @PostMapping("/upload")
    public ResponseEntity<Document_enset> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam("description") String description,
            @RequestParam("categorie") String categorie,
            Authentication authentication) {
        try {
            // Récupère l'admin connecté
            String email = authentication.getName();
            User admin = userRepository
                    .findByEmail(email)
                    .orElseThrow();

            // Upload et indexation
            Document_enset document = documentService
                    .uploadDocument(
                            file,
                            description,
                            categorie,
                            admin
                    );

            return ResponseEntity.ok(document);

        } catch (Exception e) {
            return ResponseEntity
                    .internalServerError()
                    .build();
        }
    }

    // Liste tous les documents
    @GetMapping
    public ResponseEntity<List<Document_enset>> getAllDocuments() {
        return ResponseEntity.ok(
                documentService.getAllDocuments()
        );
    }
    // Supprimer un document
@DeleteMapping("/{id}")
public ResponseEntity<Void> deleteDocument(
        @PathVariable Long id) {
    try {
        documentService.deleteDocument(id);
        return ResponseEntity.ok().build();
    } catch (Exception e) {
        return ResponseEntity.internalServerError().build();
    }
}
}