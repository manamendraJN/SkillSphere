package com.sliit.backend.repository;

import com.sliit.backend.model.Comment;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface CommentRepository extends MongoRepository<Comment, String> {
    List<Comment> findByLearningPlanIdOrderByCreatedAtDesc(String learningPlanId);
}