package com.sliit.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.sliit.backend.model.Answer;
import com.sliit.backend.model.Question;
import com.sliit.backend.model.User;
import com.sliit.backend.repository.QuestionRepository;
import com.sliit.backend.repository.AnswerRepository;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class QnAController {

    @Autowired
    private QuestionRepository questionRepo;

    @Autowired
    private AnswerRepository answerRepo;

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









        @PostMapping("/create/{questionId}/answers")
    public ResponseEntity<?> addAnswer(@PathVariable String questionId, @RequestBody Answer answer) {
        String currentUserId = getCurrentUserId();
        Question question = questionRepo.findById(questionId)
            .orElseThrow(() -> new RuntimeException("Question not found"));

        if (question.getUserId().equals(currentUserId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body("You cannot answer your own question");
        }

        answer.setUserId(currentUserId);
        answer.setQuestionId(questionId);
        Answer savedAnswer = answerRepo.save(answer);
        savedAnswer.setUsername(userRepo.findById(currentUserId).map(User::getUsername).orElse("Unknown"));
        return ResponseEntity.ok(savedAnswer);
    }

    @GetMapping("/get/{questionId}/answers")
    public List<Answer> getAnswersByQuestionId(@PathVariable String questionId) {
        List<Answer> answers = answerRepo.findByQuestionId(questionId);
        return answers.stream().map(a -> {
            a.setUsername(userRepo.findById(a.getUserId()).map(User::getUsername).orElse("Unknown"));
            return a;
        }).collect(Collectors.toList());
    }

    @DeleteMapping("/delete/{questionId}/answers/{answerId}")
    public ResponseEntity<?> deleteAnswer(@PathVariable String questionId, @PathVariable String answerId) {
        Answer answer = answerRepo.findById(answerId).orElseThrow(() -> new RuntimeException("Answer not found"));
        if (!answer.getUserId().equals(getCurrentUserId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You can only delete your own answers");
        }
        answerRepo.deleteById(answerId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/edit/{questionId}/answers/{answerId}")
    public ResponseEntity<?> editAnswer(
            @PathVariable String questionId, 
            @PathVariable String answerId, 
            @RequestBody Answer updatedAnswer) {
        Answer answer = answerRepo.findById(answerId).orElseThrow(() -> new RuntimeException("Answer not found"));
        if (!answer.getUserId().equals(getCurrentUserId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You can only edit your own answers");
        }
        answer.setContent(updatedAnswer.getContent());
        Answer savedAnswer = answerRepo.save(answer);
        savedAnswer.setUsername(userRepo.findById(answer.getUserId()).map(User::getUsername).orElse("Unknown"));
        return ResponseEntity.ok(savedAnswer);
    }

    @PostMapping("/{questionId}/answers/{answerId}/upvote")
    public ResponseEntity<?> upvoteAnswer(@PathVariable String questionId, @PathVariable String answerId) {
        Answer answer = answerRepo.findById(answerId).orElseThrow(() -> new RuntimeException("Answer not found"));
        String userId = getCurrentUserId();
        if (answer.getUpvotedBy().contains(userId)) {
            return ResponseEntity.badRequest().body("You have already upvoted this answer");
        }
        if (answer.getDownvotedBy().contains(userId)) {
            answer.setDownvotes(answer.getDownvotes() - 1);
            answer.getDownvotedBy().remove(userId);
        }
        answer.setUpvotes(answer.getUpvotes() + 1);
        answer.getUpvotedBy().add(userId);
        Answer savedAnswer = answerRepo.save(answer);
        savedAnswer.setUsername(userRepo.findById(answer.getUserId()).map(User::getUsername).orElse("Unknown"));
        return ResponseEntity.ok(savedAnswer);
    }

    @PostMapping("/{questionId}/answers/{answerId}/downvote")
    public ResponseEntity<?> downvoteAnswer(@PathVariable String questionId, @PathVariable String answerId) {
        Answer answer = answerRepo.findById(answerId).orElseThrow(() -> new RuntimeException("Answer not found"));
        String userId = getCurrentUserId();
        if (answer.getDownvotedBy().contains(userId)) {
            return ResponseEntity.badRequest().body("You have already downvoted this answer");
        }
        if (answer.getUpvotedBy().contains(userId)) {
            answer.setUpvotes(answer.getUpvotes() - 1);
            answer.getUpvotedBy().remove(userId);
        }
        answer.setDownvotes(answer.getDownvotes() + 1);
        answer.getDownvotedBy().add(userId);
        Answer savedAnswer = answerRepo.save(answer);
        savedAnswer.setUsername(userRepo.findById(answer.getUserId()).map(User::getUsername).orElse("Unknown"));
        return ResponseEntity.ok(savedAnswer);
    }

    @PostMapping("/{questionId}/answers/{answerId}/best")
    public Answer markBestAnswer(@PathVariable String questionId, @PathVariable String answerId) {
        Answer answer = answerRepo.findById(answerId).orElseThrow(() -> new RuntimeException("Answer not found"));
        Question question = questionRepo.findById(questionId).orElseThrow(() -> new RuntimeException("Question not found"));
        if (!question.getUserId().equals(getCurrentUserId())) {
            throw new RuntimeException("Only the question owner can mark an answer as best");
        }
        answer.setBestAnswer(true);
        Answer savedAnswer = answerRepo.save(answer);
        savedAnswer.setUsername(userRepo.findById(answer.getUserId()).map(User::getUsername).orElse("Unknown"));
        return savedAnswer;
    }
}