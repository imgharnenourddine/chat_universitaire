package ma.enset.ask_enset.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChangePasswordRequest {
    private String ancienPassword;
    private String nouveauPassword;
}