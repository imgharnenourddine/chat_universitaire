package ma.enset.ask_enset.repository;

import ma.enset.ask_enset.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MessageRepository
        extends JpaRepository<Message, Long> {

    List<Message> findByConversationId(Long conversationId);
    int countByConversationId(Long conversationId);
}