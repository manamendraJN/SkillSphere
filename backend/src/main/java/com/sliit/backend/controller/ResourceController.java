package com.sliit.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.sliit.backend.model.Resource;
import com.sliit.backend.model.User;
import com.sliit.backend.repository.ResourceRepository;
import com.sliit.backend.repository.UserRepository;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/resources")
public class ResourceController {

    @Autowired
    private ResourceRepository resourceRepo;

    @Autowired
    private UserRepository userRepo;

    private String getCurrentUserId() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepo.findByUsername(username).map(User::getId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // Create a new resource
    @PostMapping("/create")
    public ResponseEntity<?> createResource(@RequestBody Resource resource) {
        String userId = getCurrentUserId();
        resource.setUserId(userId);
        resource.setUsername(userRepo.findById(userId).map(User::getUsername).orElse("Unknown"));

        // Validate resource type
        if (!List.of("PDF", "Link", "Text").contains(resource.getType())) {
            return ResponseEntity.badRequest().body("Invalid resource type. Must be PDF, Link, or Text.");
        }

        // Validate URL (basic check, can be enhanced with proper URL validation)
        if ("Link".equals(resource.getType()) && (resource.getUrl() == null || !resource.getUrl().startsWith("http"))) {
            return ResponseEntity.badRequest().body("Invalid URL for Link resource.");
        }

        Resource savedResource = resourceRepo.save(resource);
        return ResponseEntity.ok(savedResource);
    }

    // Get all resources
    @GetMapping("/getall")
    public List<Resource> getAllResources() {
        List<Resource> resources = resourceRepo.findAll();
        return resources.stream().map(r -> {
            r.setUsername(userRepo.findById(r.getUserId()).map(User::getUsername).orElse("Unknown"));
            return r;
        }).collect(Collectors.toList());
    }

    // Get resource by ID
    @GetMapping("/{id}")
    public Resource getResourceById(@PathVariable String id) {
        Resource resource = resourceRepo.findById(id).orElseThrow(() -> new RuntimeException("Resource not found"));
        resource.setUsername(userRepo.findById(resource.getUserId()).map(User::getUsername).orElse("Unknown"));
        return resource;
    }

    // Get resources by category
    @GetMapping("/category/{category}")
    public List<Resource> getResourcesByCategory(@PathVariable String category) {
        List<Resource> resources = resourceRepo.findByCategory(category);
        return resources.stream().map(r -> {
            r.setUsername(userRepo.findById(r.getUserId()).map(User::getUsername).orElse("Unknown"));
            return r;
        }).collect(Collectors.toList());
    }

    // Get resources by tag
    @GetMapping("/tag/{tag}")
    public List<Resource> getResourcesByTag(@PathVariable String tag) {
        List<Resource> resources = resourceRepo.findByTagsContaining(tag);
        return resources.stream().map(r -> {
            r.setUsername(userRepo.findById(r.getUserId()).map(User::getUsername).orElse("Unknown"));
            return r;
        }).collect(Collectors.toList());
    }

    // Update a resource
    @PutMapping("/edit/{id}")
    public ResponseEntity<?> editResource(@PathVariable String id, @RequestBody Resource updatedResource) {
        Resource resource = resourceRepo.findById(id).orElseThrow(() -> new RuntimeException("Resource not found"));
        if (!resource.getUserId().equals(getCurrentUserId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You can only edit your own resources");
        }

        // Validate resource type
        if (!List.of("PDF", "Link", "Text").contains(updatedResource.getType())) {
            return ResponseEntity.badRequest().body("Invalid resource type. Must be PDF, Link, or Text.");
        }

        // Validate URL for Link type
        if ("Link".equals(updatedResource.getType())
                && (updatedResource.getUrl() == null || !updatedResource.getUrl().startsWith("http"))) {
            return ResponseEntity.badRequest().body("Invalid URL for Link resource.");
        }

        resource.setTitle(updatedResource.getTitle());
        resource.setDescription(updatedResource.getDescription());
        resource.setCategory(updatedResource.getCategory());
        resource.setType(updatedResource.getType());
        resource.setUrl(updatedResource.getUrl());
        resource.setTags(updatedResource.getTags());

        Resource savedResource = resourceRepo.save(resource);
        savedResource.setUsername(userRepo.findById(resource.getUserId()).map(User::getUsername).orElse("Unknown"));
        return ResponseEntity.ok(savedResource);
    }

    // Delete a resource
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteResource(@PathVariable String id) {
        Resource resource = resourceRepo.findById(id).orElseThrow(() -> new RuntimeException("Resource not found"));
        if (!resource.getUserId().equals(getCurrentUserId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You can only delete your own resources");
        }
        resourceRepo.deleteById(id);
        return ResponseEntity.ok().build();
    }
}