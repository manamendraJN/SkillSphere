package com.sliit.backend.controller;

import com.sliit.backend.model.LearningPlan;
import com.sliit.backend.model.User;
import com.sliit.backend.repository.LearningPlanRepository;
import com.sliit.backend.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/learning-plans")
public class LearningPlanController {

    @Autowired
    private LearningPlanRepository planRepo;

    @Autowired
    private UserRepository userRepo;

    private String getCurrentUserId() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepo.findByUsername(username).map(User::getId).orElseThrow();
    }

    // ✅ Create a learning plan
    @PostMapping
    public LearningPlan createLearningPlan(@RequestBody LearningPlan plan) {
        String userId = getCurrentUserId();
        plan.setUserId(userId);
        plan.setCompleted(false);
        plan.setStatus("Not Started");
        LearningPlan saved = planRepo.save(plan);
        saved.setUsername(userRepo.findById(userId).map(User::getUsername).orElse("Unknown"));
        return saved;
    }

    // ✅ Get all learning plans
    @GetMapping
    public List<LearningPlan> getAllPlans() {
        return planRepo.findAll().stream().map(p -> {
            p.setUsername(userRepo.findById(p.getUserId()).map(User::getUsername).orElse("Unknown"));
            return p;
        }).collect(Collectors.toList());
    }

    // ✅ Get current user's plans
    @GetMapping("/my")
    public List<LearningPlan> getMyPlans() {
        String userId = getCurrentUserId();
        return planRepo.findByUserId(userId).stream().map(p -> {
            p.setUsername(userRepo.findById(p.getUserId()).map(User::getUsername).orElse("Unknown"));
            return p;
        }).collect(Collectors.toList());
    }

    // ✅ Update plan
    @PutMapping("/{id}")
    public ResponseEntity<?> updatePlan(@PathVariable String id, @RequestBody LearningPlan updated) {
        LearningPlan plan = planRepo.findById(id).orElseThrow(() -> new RuntimeException("Plan not found"));
        if (!plan.getUserId().equals(getCurrentUserId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Not your plan!");
        }

        plan.setTitle(updated.getTitle());
        plan.setDescription(updated.getDescription());
        plan.setDuration(updated.getDuration());
        plan.setDeadline(updated.getDeadline());
        plan.setStatus(updated.getStatus());
        plan.setModules(updated.getModules());
        plan.setProgress(updated.getProgress());
        plan.setCompleted(updated.isCompleted());

        LearningPlan saved = planRepo.save(plan);
        saved.setUsername(userRepo.findById(plan.getUserId()).map(User::getUsername).orElse("Unknown"));
        return ResponseEntity.ok(saved);
    }

    // ✅ Delete a plan
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePlan(@PathVariable String id) {
        LearningPlan plan = planRepo.findById(id).orElseThrow(() -> new RuntimeException("Plan not found"));
        if (!plan.getUserId().equals(getCurrentUserId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Not your plan!");
        }
        planRepo.deleteById(id);
        return ResponseEntity.ok().build();
    }

    // ✅ Mark as completed
    @PostMapping("/complete/{id}")
    public ResponseEntity<?> markAsComplete(@PathVariable String id) {
        LearningPlan plan = planRepo.findById(id).orElseThrow(() -> new RuntimeException("Plan not found"));
        if (!plan.getUserId().equals(getCurrentUserId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Not your plan!");
        }
        plan.setCompleted(true);
        plan.setStatus("Completed");
        LearningPlan saved = planRepo.save(plan);
        saved.setUsername(userRepo.findById(plan.getUserId()).map(User::getUsername).orElse("Unknown"));
        return ResponseEntity.ok(saved);
    }

    // ✅ Add comment to plan
    @PostMapping("/comment/{planId}")
    public ResponseEntity<?> addComment(@PathVariable String planId, @RequestBody LearningPlan.Comment comment) {
        String userId = getCurrentUserId();
        comment.setUserId(userId);
        comment.setUsername(userRepo.findById(userId).map(User::getUsername).orElse("Anonymous"));

        LearningPlan plan = planRepo.findById(planId).orElseThrow(() -> new RuntimeException("Plan not found"));
        if (plan.getComments() == null) {
            plan.setComments(new ArrayList<>());
        }

        plan.getComments().add(comment);
        LearningPlan updated = planRepo.save(plan);
        return ResponseEntity.ok(updated);
    }
}
