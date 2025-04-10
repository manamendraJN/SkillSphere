package com.sliit.backend.controller;

import com.sliit.backend.model.Post;
import com.sliit.backend.model.Post.Comment;
import com.sliit.backend.model.User;
import com.sliit.backend.repository.PostRepository;
import com.sliit.backend.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;

@RestController
@RequestMapping("/api")
public class PostController {

    @Autowired
    private PostRepository postRepo;

    @Autowired
    private UserRepository userRepo;

    private String getCurrentUserId() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepo.findByUsername(username).map(User::getId).orElseThrow();
    }

    @PostMapping(value = "/posts", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createPost(
            @RequestParam("description") String description,
            @RequestParam(value = "images", required = false) List<MultipartFile> images,
            @RequestParam(value = "video", required = false) MultipartFile video) {

        try {
            String userId = getCurrentUserId();

            if (description == null || description.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Description cannot be empty.");
            }

            if (images != null && images.size() > 3) {
                return ResponseEntity.badRequest().body("You can only upload up to 3 images.");
            }

            if (images != null && !images.isEmpty() && video != null) {
                return ResponseEntity.badRequest().body("Cannot upload both images and video.");
            }

            List<String> imageUrls = new ArrayList<>();
            if (images != null) {
                for (MultipartFile image : images) {
                    if (!image.getContentType().startsWith("image/")) {
                        return ResponseEntity.badRequest().body("Only image files are allowed.");
                    }
                    if (image.getSize() > 5 * 1024 * 1024) {
                        return ResponseEntity.badRequest().body("Image file size exceeds 5MB.");
                    }
                    String imageName = System.currentTimeMillis() + "_" + image.getOriginalFilename();
                    Path path = Paths.get("uploads", imageName);
                    Files.createDirectories(path.getParent());
                    Files.write(path, image.getBytes());
                    imageUrls.add("http://localhost:8080/uploads/" + imageName);
                }
            }

            String videoUrl = null;
            if (video != null) {
                if (!video.getContentType().startsWith("video/")) {
                    return ResponseEntity.badRequest().body("Only video files are allowed.");
                }
                if (video.getSize() > 50 * 1024 * 1024) {
                    return ResponseEntity.badRequest().body("Video file size exceeds 50MB.");
                }
                String videoName = System.currentTimeMillis() + "_" + video.getOriginalFilename();
                Path path = Paths.get("uploads", videoName);
                Files.createDirectories(path.getParent());
                Files.write(path, video.getBytes());
                videoUrl = "http://localhost:8080/uploads/" + videoName;
            }

            Post post = new Post();
            post.setUserId(userId);
            post.setDescription(description);
            post.setImageUrls(imageUrls);
            post.setVideoUrl(videoUrl);
            post.setCreatedAt(new Date());
            post.setLikes(0);
            post.setLikedUsers(new ArrayList<>());
            post.setComments(new ArrayList<>());

            Post savedPost = postRepo.save(post);
            savedPost.setUsername(userRepo.findById(userId).map(User::getUsername).orElse("Unknown"));

            return ResponseEntity.ok(savedPost);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error creating post: " + e.getMessage());
        }
    }

    @GetMapping("/posts")
    public List<Post> getAllPosts() {
        List<Post> posts = postRepo.findAll();
        return posts.stream().map(p -> {
            p.setUsername(userRepo.findById(p.getUserId()).map(User::getUsername).orElse("Unknown"));
            return p;
        }).toList();
    }

    @DeleteMapping("/posts/{postId}")
    public ResponseEntity<?> deletePost(@PathVariable String postId) {
        Post post = postRepo.findById(postId).orElseThrow(() -> new RuntimeException("Post not found"));
        if (!post.getUserId().equals(getCurrentUserId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You can only delete your own posts");
        }
        postRepo.deleteById(postId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/posts/{postId}")
    public ResponseEntity<?> updatePost(@PathVariable String postId, @RequestBody Post updatedPost) {
        Post post = postRepo.findById(postId).orElseThrow(() -> new RuntimeException("Post not found"));
        if (!post.getUserId().equals(getCurrentUserId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You can only edit your own posts");
        }
        post.setDescription(updatedPost.getDescription());
        Post saved = postRepo.save(post);
        saved.setUsername(userRepo.findById(post.getUserId()).map(User::getUsername).orElse("Unknown"));
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/posts/{postId}/like")
    public ResponseEntity<?> likeOrUnlikePost(@PathVariable String postId) {
        Post post = postRepo.findById(postId).orElseThrow(() -> new RuntimeException("Post not found"));
        String userId = getCurrentUserId();

        if (post.getLikedUsers() == null) {
            post.setLikedUsers(new ArrayList<>());
        }

        if (post.getLikedUsers().contains(userId)) {
            post.getLikedUsers().remove(userId);
            post.setLikes(post.getLikes() - 1);
        } else {
            post.getLikedUsers().add(userId);
            post.setLikes(post.getLikes() + 1);
        }

        Post savedPost = postRepo.save(post);
        savedPost.setUsername(userRepo.findById(post.getUserId()).map(User::getUsername).orElse("Unknown"));
        return ResponseEntity.ok(savedPost);
    }

    @PostMapping("/posts/{postId}/comment")
    public ResponseEntity<?> addComment(@PathVariable String postId, @RequestBody Map<String, String> request) {
        Post post = postRepo.findById(postId).orElseThrow(() -> new RuntimeException("Post not found"));
        String userId = getCurrentUserId();
        String commentText = request.get("text");

        if (commentText == null || commentText.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Comment cannot be empty.");
        }

        Comment comment = new Comment();
        comment.setUserId(userId);
        comment.setUsername(userRepo.findById(userId).map(User::getUsername).orElse("Unknown"));
        comment.setText(commentText);
        comment.setCreatedAt(new Date());

        if (post.getComments() == null) {
            post.setComments(new ArrayList<>());
        }

        post.getComments().add(comment);
        Post updated = postRepo.save(post);
        updated.setUsername(userRepo.findById(updated.getUserId()).map(User::getUsername).orElse("Unknown"));
        return ResponseEntity.ok(updated);
    }
}
