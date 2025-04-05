package com.sliit.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.sliit.backend.model.Question;
import com.sliit.backend.model.User;
import com.sliit.backend.repository.QuestionRepository;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class QnAController {

    @Autowired
    private QuestionRepository questionRepo;

    @Autowired
    private com.sliit.backend.repository.UserRepository userRepo;

    private String getCurrentUserId() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepo.findByUsername(username).map(User::getId).orElseThrow();
    }

    @PostMapping("/create/questions")
    public Question createQuestion(@RequestBody Question question) {
        String userId = getCurrentUserId();
        question.setUserId(userId);
        Question savedQuestion = questionRepo.save(question);
        savedQuestion.setUsername(userRepo.findById(userId).map(User::getUsername).orElse("Unknown"));
        return savedQuestion;
    }

    @GetMapping("/getall/questions")
    public List<Question> getAllQuestions() {
        List<Question> questions = questionRepo.findAll();
        return questions.stream().map(q -> {
            q.setUsername(userRepo.findById(q.getUserId()).map(User::getUsername).orElse("Unknown"));
            return q;
        }).collect(Collectors.toList());
    }

    @GetMapping("/questions/{id}")
    public Question getQuestionById(@PathVariable String id) {
        Question question = questionRepo.findById(id).orElseThrow(() -> new RuntimeException("Question not found"));
        question.setUsername(userRepo.findById(question.getUserId()).map(User::getUsername).orElse("Unknown"));
        return question;
    }

    @DeleteMapping("/delete/questions/{id}")
    public ResponseEntity<?> deleteQuestion(@PathVariable String id) {
        Question question = questionRepo.findById(id).orElseThrow(() -> new RuntimeException("Question not found"));
        if (!question.getUserId().equals(getCurrentUserId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You can only delete your own questions");
        }
        questionRepo.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/edit/questions/{id}")
    public ResponseEntity<?> editQuestion(@PathVariable String id, @RequestBody Question updatedQuestion) {
        Question question = questionRepo.findById(id).orElseThrow(() -> new RuntimeException("Question not found"));
        if (!question.getUserId().equals(getCurrentUserId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You can only edit your own questions");
        }
        question.setTitle(updatedQuestion.getTitle());
        question.setDescription(updatedQuestion.getDescription());
        Question savedQuestion = questionRepo.save(question);
        savedQuestion.setUsername(userRepo.findById(question.getUserId()).map(User::getUsername).orElse("Unknown"));
        return ResponseEntity.ok(savedQuestion);
    }
}