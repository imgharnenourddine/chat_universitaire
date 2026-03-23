package ma.enset.ask_enset.service;

import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import lombok.RequiredArgsConstructor;
import ma.enset.ask_enset.dto.ChangePasswordRequest;
import ma.enset.ask_enset.dto.ProfileResponse;
import ma.enset.ask_enset.dto.UpdateProfileRequest;
import ma.enset.ask_enset.model.Conversation;
import ma.enset.ask_enset.model.User;
import ma.enset.ask_enset.repository.ConversationRepository;
import ma.enset.ask_enset.repository.MessageRepository;
import ma.enset.ask_enset.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final UserRepository userRepository;
    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final PasswordEncoder passwordEncoder;
    private final MinioClient minioClient;

    @Value("${minio.bucket-name}")
    private String bucketName;

    // GET /api/profile
    public ProfileResponse getProfile(Authentication auth) {
        User user = getUser(auth);
        List<Conversation> conversations = conversationRepository
                .findByUserId(user.getId());

        List<ProfileResponse.ConversationStats> stats = conversations.stream()
                .map(c -> new ProfileResponse.ConversationStats(
                        c.getId(),
                        c.getTitre(),
                        c.getCreatedAt().toString(),
                        messageRepository.findByConversationId(c.getId()).size()
                ))
                .collect(Collectors.toList());

        int totalMessages = stats.stream()
                .mapToInt(ProfileResponse.ConversationStats::getNombreMessages)
                .sum();

        return new ProfileResponse(
                user.getId(),
                user.getNom(),
                user.getPrenom(),
                user.getEmail(),
                user.getRole().name(),
                user.getImagePath(),
                conversations.size(),
                totalMessages,
                stats
        );
    }

    // PUT /api/profile
    public ProfileResponse updateProfile(UpdateProfileRequest request,
                                         Authentication auth) {
        User user = getUser(auth);
        user.setNom(request.getNom());
        user.setPrenom(request.getPrenom());
        userRepository.save(user);
        return getProfile(auth);
    }

    // PUT /api/profile/password
    public void changePassword(ChangePasswordRequest request,
                               Authentication auth) {
        User user = getUser(auth);

        if (!passwordEncoder.matches(
                request.getAncienPassword(), user.getPassword())) {
            throw new RuntimeException("Ancien mot de passe incorrect !");
        }

        user.setPassword(passwordEncoder.encode(request.getNouveauPassword()));
        userRepository.save(user);
    }

    // POST /api/profile/photo
    public ProfileResponse uploadPhoto(MultipartFile file,
                                       Authentication auth) throws Exception {
        User user = getUser(auth);

        String fileName = "profiles/" + user.getId() + "_" +
                file.getOriginalFilename();

        // Upload dans MinIO
        minioClient.putObject(
                PutObjectArgs.builder()
                        .bucket(bucketName)
                        .object(fileName)
                        .stream(file.getInputStream(),
                                file.getSize(), -1)
                        .contentType(file.getContentType())
                        .build()
        );

        user.setImagePath(fileName);
        userRepository.save(user);
        return getProfile(auth);
    }

    private User getUser(Authentication auth) {
        return userRepository
                .findByEmail(auth.getName())
                .orElseThrow(() ->
                        new RuntimeException("Utilisateur non trouvé"));
    }
}