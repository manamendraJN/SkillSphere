package com.sliit.backend.controller;

import com.sliit.backend.model.Comment;
import com.sliit.backend.model.User;
import com.sliit.backend.repository.CommentRepository;
import com.sliit.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/comments")
public class CommentController {

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private UserRepository userRepository;

    // Helper method to get the current authenticated user's ID
    private String getCurrentUserId() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .map(User::getId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // Create a new comment for a specific learning plan
    @PostMapping("/plan/{planId}")
    public ResponseEntity<Comment> createComment(
            @PathVariable String planId,
            @RequestBody Comment comment) {
        String userId = getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        comment.setUserId(userId);
        comment.setUsername(user.getUsername());
        comment.setLearningPlanId(planId);
        comment.setCreatedAt(java.time.LocalDateTime.now());

        Comment savedComment = commentRepository.save(comment);
        return ResponseEntity.ok(savedComment);
    }

    // Get all comments for a specific learning plan
    @GetMapping("/plan/{planId}")
    public ResponseEntity<List<Map<String, Object>>> getCommentsByPlanId(@PathVariable String planId) {
        String currentUserId = getCurrentUserId();
        List<Comment> comments = commentRepository.findByLearningPlanIdOrderByCreatedAtDesc(planId);
        List<Map<String, Object>> response = comments.stream().map(comment -> {
            Map<String, Object> commentData = new HashMap<>();
            commentData.put("id", comment.getId());
            commentData.put("message", comment.getMessage());
            commentData.put("resourceLink", comment.getResourceLink());
            commentData.put("username", comment.getUsername());
            commentData.put("userId", comment.getUserId());
            commentData.put("learningPlanId", comment.getLearningPlanId());
            commentData.put("createdAt", comment.getCreatedAt());
            commentData.put("count", comment.getLikeCount());
            commentData.put("likedByUser", comment.getLikedBy().contains(currentUserId));
            return commentData;
        }).toList();
        return ResponseEntity.ok(response);
    }

    // Update a comment
    @PutMapping("/{id}")
    public ResponseEntity<?> updateComment(
            @PathVariable String id,
            @RequestBody Comment updatedComment) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        if (!comment.getUserId().equals(getCurrentUserId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("You are not authorized to update this comment!");
        }

        comment.setMessage(updatedComment.getMessage());
        comment.setResourceLink(updatedComment.getResourceLink());

        Comment savedComment = commentRepository.save(comment);
        return ResponseEntity.ok(savedComment);
    }

    // Delete a comment
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteComment(@PathVariable String id) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        if (!comment.getUserId().equals(getCurrentUserId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("You are not authorized to delete this comment!");
        }

        commentRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    // Like or unlike a comment
    @PostMapping("/{id}/like")
    public ResponseEntity<Map<String, Object>> likeComment(
            @PathVariable String id,
            @RequestBody Map<String, Boolean> request) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        String userId = getCurrentUserId();
        boolean like = request.getOrDefault("like", true);
        List<String> likedBy = comment.getLikedBy();

        if (like && !likedBy.contains(userId)) {
            likedBy.add(userId);
            comment.setLikeCount(comment.getLikeCount() + 1);
        } else if (!like && likedBy.contains(userId)) {
            likedBy.remove(userId);
            comment.setLikeCount(comment.getLikeCount() - 1);
        }

        Comment updatedComment = commentRepository.save(comment);
        Map<String, Object> response = new HashMap<>();
        response.put("count", updatedComment.getLikeCount());
        response.put("likedByUser", updatedComment.getLikedBy().contains(userId));
        return ResponseEntity.ok(response);
    }

    // Get like information for a comment
    @GetMapping("/{id}/likes")
    public ResponseEntity<Map<String, Object>> getCommentLikes(@PathVariable String id) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        String currentUserId = getCurrentUserId();
        Map<String, Object> response = new HashMap<>();
        response.put("count", comment.getLikeCount());
        response.put("likedByUser", comment.getLikedBy().contains(currentUserId));
        return ResponseEntity.ok(response);
    }
}