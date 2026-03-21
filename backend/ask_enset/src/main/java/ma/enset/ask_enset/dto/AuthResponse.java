package ma.enset.ask_enset.dto;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class AuthResponse {

    private String token;
    private String nom;
    private String prenom;
    private String email;
    private String role;
    private String imagePath;
}
