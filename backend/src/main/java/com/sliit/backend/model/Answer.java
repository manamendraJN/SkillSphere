package com.sliit.backend.model;

import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.web.bind.annotation.CrossOrigin;

@CrossOrigin(origins = "http://localhost:5173")
@Document(collection = "answers")
public class Answer {
    @Id
    private String id;
    private String content;
    private String userId;
    private int upvotes = 0;
    private int downvotes = 0;
    private boolean isBestAnswer = false;
    private String questionId;
    private String username; // New field
    private List<String> upvotedBy = new ArrayList<>();
    private List<String> downvotedBy = new ArrayList<>();

    public Answer() {}
    public Answer(String content, String userId, String questionId) {
        this.content = content;
        this.userId = userId;
        this.questionId = questionId;
    }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public List<String> getUpvotedBy() { return upvotedBy; }
    public void setUpvotedBy(List<String> upvotedBy) { this.upvotedBy = upvotedBy; }
    public List<String> getDownvotedBy() { return downvotedBy; }
    public void setDownvotedBy(List<String> downvotedBy) { this.downvotedBy = downvotedBy; }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public int getUpvotes() { return upvotes; }
    public void setUpvotes(int upvotes) { this.upvotes = upvotes; }
    public int getDownvotes() { return downvotes; }
    public void setDownvotes(int downvotes) { this.downvotes = downvotes; }
    public boolean isBestAnswer() { return isBestAnswer; }
    public void setBestAnswer(boolean bestAnswer) { isBestAnswer = bestAnswer; }
    public String getQuestionId() { return questionId; }
    public void setQuestionId(String questionId) { this.questionId = questionId; }
}
