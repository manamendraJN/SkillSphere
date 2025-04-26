package com.sliit.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@Document(collection = "resources")
public class Resource {
    @Id
    private String id;
    private String title;
    private String description;
    private String userId;
    private String username; // To display uploader's username
    private String category; // Skill category (e.g., Programming, Photography)
    private String type; // Resource type (e.g., PDF, Link, Text)
    private String url; // URL for links or cloud storage path for files
    private List<String> tags; // Keywords for searchability

    public Resource() {
    }

    public Resource(String title, String description, String userId, String category, String type, String url,
            List<String> tags) {
        this.title = title;
        this.description = description;
        this.userId = userId;
        this.category = category;
        this.type = type;
        this.url = url;
        this.tags = tags;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public List<String> getTags() {
        return tags;
    }

    public void setTags(List<String> tags) {
        this.tags = tags;
    }
}
