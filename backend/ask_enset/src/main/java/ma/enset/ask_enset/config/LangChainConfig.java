package ma.enset.ask_enset.config;

import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.model.mistralai.MistralAiChatModel;
import dev.langchain4j.model.mistralai.MistralAiEmbeddingModel;
import dev.langchain4j.store.embedding.EmbeddingStore;
import dev.langchain4j.store.embedding.qdrant.QdrantEmbeddingStore;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class LangChainConfig {

    @Value("${langchain4j.mistral-ai.api-key}")
    private String mistralApiKey;

    @Value("${qdrant.host}")
    private String qdrantHost;

    @Value("${qdrant.port}")
    private int qdrantPort;

    @Value("${qdrant.collection-name}")
    private String collectionName;

    // Modèle de chat (génération de réponses)
    @Bean
    public MistralAiChatModel chatModel() {
        return MistralAiChatModel.builder()
                .apiKey(mistralApiKey)
                .modelName("mistral-small-latest")
                .build();
    }

    // Modèle d'embeddings (vectorisation)
    @Bean
    public MistralAiEmbeddingModel embeddingModel() {
        return MistralAiEmbeddingModel.builder()
                .apiKey(mistralApiKey)
                .modelName("mistral-embed")
                .build();
    }

    // Base de données vectorielle (Qdrant)
    @Bean
    public EmbeddingStore<TextSegment> embeddingStore() {
        return QdrantEmbeddingStore.builder()
                .host(qdrantHost)
                .port(qdrantPort)
                .collectionName(collectionName)
                .payloadTextKey("text") // ← ajoute ça ✅
                .build();
    }
}