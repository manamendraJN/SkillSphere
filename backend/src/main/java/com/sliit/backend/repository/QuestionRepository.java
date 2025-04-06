package com.sliit.backend.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.web.bind.annotation.CrossOrigin;

import com.sliit.backend.model.Question;
@CrossOrigin(origins = "http://localhost:5173")
public interface QuestionRepository extends MongoRepository<Question, String> {
}
