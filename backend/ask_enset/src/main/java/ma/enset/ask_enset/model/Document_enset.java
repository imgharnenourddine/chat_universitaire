package ma.enset.ask_enset.model;


import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "documents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Document_enset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nom_fichier", nullable = false)
    private String nomFichier;

    @Column(nullable = false)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Categorie categorie;

    @Column(name = "chemin_minio", nullable = false)
    private String cheminMinio;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Statut statut = Statut.EN_ATTENTE;


    
    @ManyToOne
    @JoinColumn(name = "uploaded_by", nullable = false)
    @JsonIgnoreProperties({"password", "authorities", "accountNonExpired", "accountNonLocked", "credentialsNonExpired", "enabled"})
    private User uploadedBy;


    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public enum Categorie {
        EMPLOI_DU_TEMPS, EXAMEN, REGLEMENT, STAGE
    }

    public enum Statut {
        EN_ATTENTE, INDEXE, ERREUR
    }
}
