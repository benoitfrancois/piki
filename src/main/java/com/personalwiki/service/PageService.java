package com.personalwiki.service;

import com.personalwiki.dto.PageRequestDTO;
import com.personalwiki.model.Page;
import com.personalwiki.model.Tag;
import com.personalwiki.model.Type;
import com.personalwiki.repository.PageRepository;
import com.personalwiki.repository.TagRepository;
import com.personalwiki.repository.TypeRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class PageService {

    @Autowired
    private PageRepository pageRepository;

    @Autowired
    private TagRepository tagRepository;

    @Autowired
    private TypeRepository typeRepository;

    public List<Page> getAllPages() {
        return pageRepository.findAllWithTags();
    }

    public Optional<Page> getPageById(Long id) {
        return pageRepository.findByIdWithTags(id);
    }

    public List<Page> getPagesByType(Long typeId) {
        return typeRepository.findById(typeId)
                .map(type -> pageRepository.findByTypeWithTags(type))
                .orElse(List.of());
    }

    public List<Tag> getAllTags() {
        return tagRepository.findAll();
    }

    @Transactional
    public Page createPage(PageRequestDTO dto) {
        Page page = new Page();
        page.setTitle(dto.getTitle());
        page.setContent(dto.getContent());

        // Resolve the type from its ID (the object received may be partial)
        resolveType(dto.getType()).ifPresent(page::setType);

        if (dto.getTags() != null && !dto.getTags().isEmpty()) {
            findOrCreateTags(dto.getTags()).forEach(page::addTag);
        }

        return pageRepository.save(page);
    }

    @Transactional
    public Page updatePage(Long id, PageRequestDTO dto) {
        Page page = pageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Page not found : " + id));

        page.setTitle(dto.getTitle());
        page.setContent(dto.getContent());

        // Update the Type
        Optional<Type> resolved = resolveType(dto.getType());
        page.setType(resolved.orElse(null));

        page.getTags().clear();
        if (dto.getTags() != null && !dto.getTags().isEmpty()) {
            findOrCreateTags(dto.getTags()).forEach(page::addTag);
        }

        return pageRepository.save(page);
    }

    @Transactional
    public void deletePage(Long id) {
        pageRepository.deleteById(id);
    }

    /**
     * Retrieves the managed type from the database based on the partial object received from the DTO.
     * Angular sends { id: X, name: ‘...’, colour: ‘...’, icon: ‘...’ }
     * Only the ID is used to find the entity managed by Hibernate.
     */
    private Optional<Type> resolveType(Type dtoType) {
        if (dtoType == null || dtoType.getId() == null) return Optional.empty();
        return typeRepository.findById(dtoType.getId());
    }

    private Set<Tag> findOrCreateTags(List<String> tagNames) {
        Set<Tag> tags = new HashSet<>();
        for (String tagName : tagNames) {
            String normalizedName = tagName.toLowerCase().trim();
            Tag tag = tagRepository.findByNameIgnoreCase(normalizedName)
                    .orElseGet(() -> tagRepository.save(new Tag(normalizedName)));
            tags.add(tag);
        }
        return tags;
    }

    public List<Page> searchByTitle(String title) {
        return pageRepository.findByTitleContainingIgnoreCase(title);
    }

}
