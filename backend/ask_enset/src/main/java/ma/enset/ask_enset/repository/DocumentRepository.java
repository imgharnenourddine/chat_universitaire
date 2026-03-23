package ma.enset.ask_enset.repository;

import ma.enset.ask_enset.model.Document_enset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DocumentRepository
        extends JpaRepository<Document_enset, Long> {
}