package ma.enset.ask_enset.controller;

import lombok.RequiredArgsConstructor;
import ma.enset.ask_enset.dto.ChatRequest;
import ma.enset.ask_enset.dto.ChatResponse;
import ma.enset.ask_enset.model.Conversation;
import ma.enset.ask_enset.model.Message;
import ma.enset.ask_enset.service.ChatService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class ChatController {

    private final ChatService chatService;
    // Supprimer une conversation
@DeleteMapping("/conversations/{id}")
public ResponseEntity<Void> deleteConversation(
        @PathVariable Long id) {
    chatService.deleteConversation(id);
    return ResponseEntity.ok().build();
}

// Renommer une conversation
@PutMapping("/conversations/{id}")
public ResponseEntity<Conversation> renameConversation(
        @PathVariable Long id,
        @RequestBody Map<String, String> body) {
    String nouveauTitre = body.get("titre");
    return ResponseEntity.ok(
        chatService.renameConversation(id, nouveauTitre)
    );
}

    // Envoyer une question au chatbot
    @PostMapping
    public ResponseEntity<ChatResponse> chat(
            @RequestBody ChatRequest request,
            Authentication authentication) {
        ChatResponse response = chatService.chat(
                request.getQuestion(),
                request.getConversationId(),
                authentication
        );
        return ResponseEntity.ok(response);
    }

    // Récupère toutes les conversations
    @GetMapping("/conversations")
    public ResponseEntity<List<Conversation>> getConversations(
            Authentication authentication) {
        return ResponseEntity.ok(
                chatService.getConversations(authentication)
        );
    }

    // Récupère les messages d'une conversation
    @GetMapping("/conversations/{id}/messages")
    public ResponseEntity<List<Message>> getMessages(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                chatService.getMessages(id)
        );
    }
}