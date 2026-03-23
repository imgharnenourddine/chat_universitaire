package ma.enset.ask_enset.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class ChatResponse {
    private String response;
    private Long conversationId;
}