package ma.enset.ask_enset.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateProfileRequest {
    private String nom;
    private String prenom;
}