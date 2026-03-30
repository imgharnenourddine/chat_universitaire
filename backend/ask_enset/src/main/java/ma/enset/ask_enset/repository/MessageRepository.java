package ma.enset.ask_enset.repository;

import ma.enset.ask_enset.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    // ✅ ancienne méthode — gardée pour ProfileService
    List<Message> findByConversationId(Long conversationId);

    // ✅ nouvelle méthode — ordonnée par date
    List<Message> findByConversationIdOrderByCreatedAtAsc(Long conversationId);
}