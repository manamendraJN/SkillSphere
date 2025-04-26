package com.sliit.backend.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.web.bind.annotation.CrossOrigin;
import com.sliit.backend.model.Resource;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
public interface ResourceRepository extends MongoRepository<Resource, String> {
    List<Resource> findByCategory(String category);

    List<Resource> findByTagsContaining(String tag);
}