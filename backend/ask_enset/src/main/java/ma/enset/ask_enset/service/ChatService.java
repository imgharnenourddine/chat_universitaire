package ma.enset.ask_enset.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import ma.enset.ask_enset.dto.ChatResponse;
import dev.langchain4j.data.embedding.Embedding;
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.model.mistralai.MistralAiChatModel;
import dev.langchain4j.model.mistralai.MistralAiEmbeddingModel;
import dev.langchain4j.model.output.Response;
import dev.langchain4j.store.embedding.EmbeddingStore;
import ma.enset.ask_enset.model.Conversation;
import ma.enset.ask_enset.model.Message;
import ma.enset.ask_enset.model.User;
import ma.enset.ask_enset.repository.ConversationRepository;
import ma.enset.ask_enset.repository.MessageRepository;
import ma.enset.ask_enset.repository.UserRepository;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;

@Service
public class ChatService {

    private final MistralAiChatModel chatModel;
    private final MistralAiEmbeddingModel embeddingModel;
    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${qdrant.host}")
    private String qdrantHost;

    @Value("${qdrant.rest-port}")
    private int qdrantRestPort;

    @Value("${qdrant.collection-name}")
    private String collectionName;

    public ChatService(
            @Qualifier("chatModel") MistralAiChatModel chatModel,
            @Qualifier("embeddingModel") MistralAiEmbeddingModel embeddingModel,
            EmbeddingStore<TextSegment> embeddingStore,
            ConversationRepository conversationRepository,
            MessageRepository messageRepository,
            UserRepository userRepository) {
        this.chatModel = chatModel;
        this.embeddingModel = embeddingModel;
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
    }

    public ChatResponse chat(String question, Long conversationId,
                             Authentication authentication) {

        // 1. Récupère l'étudiant connecté
        String email = authentication.getName();
        User user = userRepository
                .findByEmail(email)
                .orElseThrow();

        // 2. Récupère ou crée la conversation
        Conversation conversation = getOrCreateConversation(
                conversationId, question, user
        );

        // 3. Sauvegarde le message de l'étudiant
        saveMessage(conversation, question, Message.TypeMessage.USER);

        // 4. Vectorise la question
        System.out.println("=== Vectorisation de: " + question);
        Response<Embedding> embeddingResponse = embeddingModel.embed(question);
        Embedding questionEmbedding = embeddingResponse.content();
        System.out.println("=== Taille vecteur: " + questionEmbedding.vector().length);

        if (questionEmbedding.vector().length == 0) {
            throw new RuntimeException("Erreur vectorisation - vecteur vide");
        }

        // 5. Cherche dans Qdrant via REST API (port 6333)
        String context = "";
        try {
            context = searchQdrant(questionEmbedding.vector());
            System.out.println("=== Contexte trouvé: " +
                    context.substring(0, Math.min(200, context.length())));
        } catch (Exception e) {
            System.out.println("=== Erreur Qdrant: " + e.getMessage());
        }

        // 6. Construit le prompt
        String prompt = buildPrompt(question, context);

        // 7. Génère la réponse avec Mistral
        String response = chatModel.generate(prompt);

        // 8. Sauvegarde la réponse du bot
        saveMessage(conversation, response, Message.TypeMessage.BOT);

        return new ChatResponse(response, conversation.getId());
    }
    // Supprimer une conversation
public void deleteConversation(Long conversationId) {
    // 1. Supprime tous les messages de la conversation
    List<Message> messages = messageRepository
            .findByConversationId(conversationId);
    messageRepository.deleteAll(messages);

    // 2. Supprime la conversation
    conversationRepository.deleteById(conversationId);
}

// Renommer une conversation
public Conversation renameConversation(Long conversationId, String nouveauTitre) {
    Conversation conversation = conversationRepository
            .findById(conversationId)
            .orElseThrow();
    conversation.setTitre(nouveauTitre);
    return conversationRepository.save(conversation);
}

    // Recherche directe dans Qdrant via REST API
    private String searchQdrant(float[] vector) throws Exception {

        // Construit le tableau de vecteurs
        StringBuilder vectorArray = new StringBuilder("[");
        for (int i = 0; i < vector.length; i++) {
            vectorArray.append(vector[i]);
            if (i < vector.length - 1) vectorArray.append(",");
        }
        vectorArray.append("]");

        // Corps de la requête
        String body = """
            {
                "vector": %s,
                "limit": 5,
                "with_payload": true,
                "with_vector": false
            }
        """.formatted(vectorArray.toString());

        // Appel REST à Qdrant sur le port 6333
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(
                        "http://" + qdrantHost + ":" + qdrantRestPort +
                                "/collections/" + collectionName + "/points/search"
                ))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();

        HttpResponse<String> response = client.send(
                request,
                HttpResponse.BodyHandlers.ofString()
        );

        System.out.println("=== Qdrant status: " + response.statusCode());
        System.out.println("=== Qdrant raw: " + response.body().substring(0, Math.min(300, response.body().length())));

        // Parse le JSON avec Jackson
        JsonNode root = objectMapper.readTree(response.body());
        JsonNode points = root.path("result");

        StringBuilder context = new StringBuilder();
        for (JsonNode point : points) {
            String text = point.path("payload").path("text").asText("");
            if (!text.isEmpty()) {
                context.append(text).append("\n\n");
            }
        }

        System.out.println("=== Nombre de chunks trouvés: " + points.size());
        return context.toString();
    }

    // Récupère ou crée une conversation
    private Conversation getOrCreateConversation(
            Long conversationId, String question, User user) {

        if (conversationId != null) {
            return conversationRepository
                    .findById(conversationId)
                    .orElseThrow();
        }

        Conversation conversation = new Conversation();
        conversation.setUser(user);
        conversation.setTitre(
                question.length() > 50
                        ? question.substring(0, 50) + "..."
                        : question
        );
        return conversationRepository.save(conversation);
    }

    // Sauvegarde un message
    private void saveMessage(
            Conversation conversation,
            String contenu,
            Message.TypeMessage type) {

        Message message = new Message();
        message.setConversation(conversation);
        message.setContenu(contenu);
        message.setType(type);
        messageRepository.save(message);
    }

    private String buildPrompt(String question, String context) {
        String baseInstruction = """
        Tu es Ask_N7, un assistant universitaire de l'ENSET Mohammedia.
        
        RÈGLES DE FORMATAGE OBLIGATOIRES :
        1. Utilise TOUJOURS le Markdown pour structurer ta réponse
        2. Commence par un titre ## avec un emoji pertinent
        3. Utilise des emojis au début de chaque point de liste
        4. Utilise des listes à puces (-) pour les énumérations
        5. Mets en **gras** les informations importantes
        6. Utilise des tableaux Markdown si tu compares des données
        7. Sois précis et concis
        8. Termine par une ligne ---
        
        EXEMPLES D'EMOJIS À UTILISER :
        📅 pour les dates et calendriers
        📍 pour les lieux et salles
        ⚠️ pour les avertissements
        ✅ pour les confirmations
        📚 pour les cours et matières
        🎓 pour les examens et diplômes
        📋 pour les listes et procédures
        💡 pour les conseils
        🏫 pour l'établissement
        """;

        if (context == null || context.isEmpty()) {
            return baseInstruction + """
                    
                    Réponds de manière générale et utile.
                    
                    Question : %s
                    
                    Réponse :
                    """.formatted(question);
        }

        return baseInstruction + """
                
                Réponds en te basant sur le contexte fourni.
                Si l'information n'est PAS dans le contexte ET que ce
                n'est pas une question générale, dis :
                "## Information non disponible
                Je n'ai pas cette information dans les documents disponibles."
                
                Contexte :
                %s
                
                Question : %s
                
                Réponse :
                """.formatted(context, question);
    }

    // Récupère l'historique des conversations
    public List<Conversation> getConversations(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository
                .findByEmail(email)
                .orElseThrow();
        return conversationRepository.findByUserId(user.getId());
    }

    // Récupère les messages d'une conversation
    public List<Message> getMessages(Long conversationId) {
        return messageRepository
                .findByConversationIdOrderByCreatedAtAsc(conversationId);
    }
}