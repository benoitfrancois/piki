package com.personalwiki.controller;

import com.personalwiki.dto.PageRequestDTO;
import com.personalwiki.model.Page;
import com.personalwiki.model.Tag;
import com.personalwiki.service.PageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pages")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200") // for Angular in dev
public class PageController {

    private final PageService pageService;

    // GET /api/pages - Retrieve all the pages
    @GetMapping
    public ResponseEntity<List<Page>> getAllPages() {
        List<Page> pages = pageService.getAllPages();
        return ResponseEntity.ok(pages);
    }

    // GET /api/pages/{id} - Retrieve one page
    @GetMapping("/{id}")
    public ResponseEntity<Page> getPageById(@PathVariable Long id) {
        return pageService.getPageById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // GET /api/pages/type/{type} - Retrieve the pages by type
    @GetMapping("/type/{typeId}")
    public ResponseEntity<List<Page>> getPagesByType(@PathVariable Long typeId) {
        List<Page> pages = pageService.getPagesByType(typeId);
        return ResponseEntity.ok(pages);
    }

    // POST /api/pages - Create a page
    @PostMapping
    public ResponseEntity<Page> createPage(@RequestBody PageRequestDTO pageRequest) {
        Page createdPage = pageService.createPage(pageRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdPage);
    }

    // PUT /api/pages/{id} - Update a page
    @PutMapping("/{id}")
    public ResponseEntity<Page> updatePage(@PathVariable Long id, @RequestBody PageRequestDTO pageRequest) {
        try {
            Page updatedPage = pageService.updatePage(id, pageRequest);
            return ResponseEntity.ok(updatedPage);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // DELETE /api/pages/{id} - Delete a page
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePage(@PathVariable Long id) {
        pageService.deletePage(id);
        return ResponseEntity.noContent().build();
    }

    // GET /api/pages/search?title=xxx - Simple search
    @GetMapping("/search")
    public ResponseEntity<List<Page>> searchPages(@RequestParam String title) {
        List<Page> pages = pageService.searchByTitle(title);
        return ResponseEntity.ok(pages);
    }

    // GET /api/pages/tags Retrieve the tags
    @GetMapping("/tags")
    public ResponseEntity<List<Tag>> getAllTags() {
        List<Tag> tags = pageService.getAllTags();
        return ResponseEntity.ok(tags);
    }
}
