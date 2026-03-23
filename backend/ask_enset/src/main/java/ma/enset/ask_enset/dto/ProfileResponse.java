package ma.enset.ask_enset.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
public class ProfileResponse {
    private Long id;
    private String nom;
    private String prenom;
    private String email;
    private String role;
    private String imagePath;
    private int totalConversations;
    private int totalMessages;
    private List<ConversationStats> conversations;

    @Getter
    @Setter
    @AllArgsConstructor
    public static class ConversationStats {
        private Long id;
        private String titre;
        private String createdAt;
        private int nombreMessages;
    }
}