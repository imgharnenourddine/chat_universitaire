package ma.enset.ask_enset.service;

import dev.langchain4j.data.document.Document;
import dev.langchain4j.data.document.DocumentSplitter;
import dev.langchain4j.data.document.splitter.DocumentSplitters;
import dev.langchain4j.data.embedding.Embedding;
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.model.mistralai.MistralAiEmbeddingModel;
import dev.langchain4j.store.embedding.EmbeddingStore;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import ma.enset.ask_enset.model.Document_enset;
import ma.enset.ask_enset.model.User;
import ma.enset.ask_enset.repository.DocumentRepository;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
public class DocumentService {

    private final MinioClient minioClient;
    private final MistralAiEmbeddingModel embeddingModel;
    private final EmbeddingStore<TextSegment> embeddingStore;
    private final DocumentRepository documentRepository;

    @Value("${minio.bucket-name}")
    private String bucketName;

    public DocumentService(
            MinioClient minioClient,
            @Qualifier("embeddingModel") MistralAiEmbeddingModel embeddingModel,
            EmbeddingStore<TextSegment> embeddingStore,
            DocumentRepository documentRepository) {
        this.minioClient = minioClient;
        this.embeddingModel = embeddingModel;
        this.embeddingStore = embeddingStore;
        this.documentRepository = documentRepository;
    }

    public Document_enset uploadDocument(
            MultipartFile file,
            String description,
            String categorie,
            User uploadedBy) throws Exception {

        String fileName = file.getOriginalFilename();
        String cheminMinio = categorie.toLowerCase() + "/" + fileName;

        // 1. Sauvegarder dans MinIO
        minioClient.putObject(
                PutObjectArgs.builder()
                        .bucket(bucketName)
                        .object(cheminMinio)
                        .stream(file.getInputStream(), file.getSize(), -1)
                        .contentType(file.getContentType())
                        .build()
        );

        // 2. Sauvegarder dans PostgreSQL
        Document_enset document = new Document_enset();
        document.setNomFichier(fileName);
        document.setDescription(description);
        document.setCategorie(Document_enset.Categorie.valueOf(categorie));
        document.setCheminMinio(cheminMinio);
        document.setStatut(Document_enset.Statut.EN_ATTENTE);
        document.setUploadedBy(uploadedBy);
        documentRepository.save(document);

        // 3. Indexer dans Qdrant
        indexDocument(document, file);

        return document;
    }

    private void indexDocument(
            Document_enset document,
            MultipartFile file) throws Exception {

        // ✅ Parser le PDF avec PDFBox directement
        PDDocument pdDocument = PDDocument.load(file.getInputStream());
        PDFTextStripper stripper = new PDFTextStripper();
        String texte = stripper.getText(pdDocument);
        pdDocument.close();

        System.out.println("=== Texte extrait: " + texte.substring(0, Math.min(200, texte.length())));

        // Créer un document LangChain4j
        Document doc = Document.from(texte);

        // Découper en chunks
        DocumentSplitter splitter = DocumentSplitters.recursive(1000, 100);
        List<TextSegment> chunks = splitter.split(doc);

        System.out.println("=== Nombre de chunks: " + chunks.size());

        // Vectoriser et stocker dans Qdrant
        for (int i = 0; i < chunks.size(); i++) {
            TextSegment chunk = chunks.get(i);
            Embedding embedding = embeddingModel
                    .embed(chunk.text())
                    .content();
            System.out.println("=== Chunk " + i + " vecteur taille: " + embedding.vector().length);
            embeddingStore.add(embedding, chunk);
            Thread.sleep(1500);
        }

        // Mettre à jour le statut
        document.setStatut(Document_enset.Statut.INDEXE);
        documentRepository.save(document);
    }
    public void deleteDocument(Long documentId) throws Exception {
    // 1. Récupère le document depuis PostgreSQL
    Document_enset document = documentRepository
            .findById(documentId)
            .orElseThrow();

    // 2. Supprime depuis MinIO
    minioClient.removeObject(
            io.minio.RemoveObjectArgs.builder()
                    .bucket(bucketName)
                    .object(document.getCheminMinio())
                    .build()
    );

    // 3. Supprime depuis PostgreSQL
    documentRepository.deleteById(documentId);
}

    public List<Document_enset> getAllDocuments() {
        return documentRepository.findAll();
    }
}