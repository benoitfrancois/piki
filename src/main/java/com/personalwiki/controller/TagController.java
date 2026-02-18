package com.personalwiki.controller;

import com.personalwiki.model.Tag;
import com.personalwiki.repository.TagRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tags")
@CrossOrigin(origins = "http://localhost:4200")
public class TagController {

    @Autowired
    private TagRepository tagRepository;

    @GetMapping
    public List<Tag> getAllTags() {
        return tagRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<?> createTag(@RequestBody Map<String, String> body) {
        String name = body.getOrDefault("name", "").toLowerCase().trim();
        if (name.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Le nom est requis"));
        }
        if (tagRepository.findByNameIgnoreCase(name).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Tag '" + name + "' existe déjà"));
        }
        return ResponseEntity.ok(tagRepository.save(new Tag(name)));
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<?> renameTag(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String name = body.getOrDefault("name", "").toLowerCase().trim();
        if (name.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Le nom est requis"));
        }
        return tagRepository.findById(id).map(tag -> {
            if (tagRepository.findByNameIgnoreCase(name).filter(t -> !t.getId().equals(id)).isPresent()) {
                return ResponseEntity.badRequest().<Tag>body(null);
            }
            tag.setName(name);
            return ResponseEntity.ok(tagRepository.save(tag));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> deleteTag(@PathVariable Long id) {
        return tagRepository.findById(id).map(tag -> {
            tag.getPages().forEach(page -> page.getTags().remove(tag));
            tagRepository.delete(tag);
            return ResponseEntity.noContent().<Void>build();
        }).orElse(ResponseEntity.notFound().build());
    }
}
