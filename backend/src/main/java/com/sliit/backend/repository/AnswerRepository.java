package com.sliit.backend.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.web.bind.annotation.CrossOrigin;

import com.sliit.backend.model.Answer;
@CrossOrigin(origins = "http://localhost:5173")
public interface AnswerRepository extends MongoRepository<Answer, String> {
    List<Answer> findByQuestionId(String questionId);
}
