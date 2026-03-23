package ma.enset.ask_enset.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChatRequest {
    private String question;
    private Long conversationId;
}