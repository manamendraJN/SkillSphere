package com.sliit.backend.controller;

import com.sliit.backend.model.Post;
import com.sliit.backend.model.User;
import com.sliit.backend.repository.PostRepository;
import com.sliit.backend.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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
        @RequestParam("images") List<MultipartFile> images,
        @RequestParam("video") MultipartFile video
    ) {
        if (images.size() > 3) {
            return ResponseEntity.badRequest().body("You can only upload up to 3 images.");
        }

        // In real app: Save files to cloud (e.g., AWS S3) or disk
        List<String> imageUrls = new ArrayList<>();
        for (MultipartFile file : images) {
            // Simulated storage
            imageUrls.add("mock-path/images/" + file.getOriginalFilename());
        }

        String videoUrl = "mock-path/videos/" + video.getOriginalFilename();

        Post post = new Post();
        post.setUserId(getCurrentUserId());
        post.setDescription(description);
        post.setImageUrls(imageUrls);
        post.setVideoUrl(videoUrl);

        Post saved = postRepo.save(post);
        saved.setUsername(userRepo.findById(post.getUserId()).map(User::getUsername).orElse("Unknown"));

        return ResponseEntity.ok(saved);
    }

    @GetMapping("/posts")
    public List<Post> getAllPosts() {
        List<Post> posts = postRepo.findAll();
        return posts.stream().map(post -> {
            post.setUsername(userRepo.findById(post.getUserId()).map(User::getUsername).orElse("Unknown"));
            return post;
        }).toList();
    }

    @PutMapping("/posts/{id}")
    public ResponseEntity<?> updatePost(@PathVariable String id, @RequestBody Post updatedPost) {
        Post post = postRepo.findById(id).orElseThrow(() -> new RuntimeException("Post not found"));
        if (!post.getUserId().equals(getCurrentUserId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You can only edit your own posts");
        }
        post.setDescription(updatedPost.getDescription());
        Post saved = postRepo.save(post);
        saved.setUsername(userRepo.findById(post.getUserId()).map(User::getUsername).orElse("Unknown"));
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/posts/{id}")
    public ResponseEntity<?> deletePost(@PathVariable String id) {
        Post post = postRepo.findById(id).orElseThrow(() -> new RuntimeException("Post not found"));
        if (!post.getUserId().equals(getCurrentUserId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You can only delete your own posts");
        }
        postRepo.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
