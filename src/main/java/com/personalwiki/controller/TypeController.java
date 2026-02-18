package com.personalwiki.controller;

import com.personalwiki.model.Type;
import com.personalwiki.service.TypeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/types")
@CrossOrigin(origins = "http://localhost:4200")
public class TypeController {

    @Autowired
    private TypeService typeService;

    @GetMapping
    public List<Type> getAllTypes() {
        return typeService.getAllTypes();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Type> getTypeById(@PathVariable Long id) {
        return typeService.getTypeById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createType(@RequestBody Map<String, String> body) {
        String name  = body.getOrDefault("name", "").trim();
        String color = body.getOrDefault("color", "gray");
        String icon  = body.getOrDefault("icon", "📄");

        if (name.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Le nom est requis"));
        }
        try {
            return ResponseEntity.ok(typeService.createType(name, color, icon));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateType(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String name  = body.getOrDefault("name", "").trim();
        String color = body.getOrDefault("color", "gray");
        String icon  = body.getOrDefault("icon", "📄");

        if (name.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Le nom est requis"));
        }
        try {
            return ResponseEntity.ok(typeService.updateType(id, name, color, icon));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteType(@PathVariable Long id) {
        try {
            typeService.deleteType(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
