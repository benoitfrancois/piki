package com.personalwiki.service;

import com.personalwiki.dto.PageRequestDTO;
import com.personalwiki.model.Page;
import com.personalwiki.model.Tag;
import com.personalwiki.repository.PageRepository;
import com.personalwiki.repository.TagRepository;
import com.personalwiki.repository.TypeRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

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
    public Page createPage(PageRequestDTO pageRequest) {
        Page page = new Page();
        page.setTitle(pageRequest.getTitle());
        page.setContent(pageRequest.getContent());

        if (pageRequest.getType() != null) {
            typeRepository.findById(pageRequest.getTypeId())
                    .ifPresent(page::setType);
        }

        if (pageRequest.getTags() != null && !pageRequest.getTags().isEmpty()) {
            Set<Tag> tags = findOrCreateTags(pageRequest.getTags());
            for (Tag tag : tags) {
                page.addTag(tag);
            }
        }

        return pageRepository.save(page);
    }

    @Transactional
    public Page updatePage(Long id, PageRequestDTO pageRequest) {
        Page page = pageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Page non trouvée : " + id));

        page.setTitle(pageRequest.getTitle());
        page.setContent(pageRequest.getContent());

        if (pageRequest.getTypeId() != null) {
            typeRepository.findById(pageRequest.getTypeId())
                    .ifPresent(page::setType);
        } else {
            page.setType(null);
        }

        page.getTags().clear();
        if (pageRequest.getTags() != null && !pageRequest.getTags().isEmpty()) {
            Set<Tag> newTags = findOrCreateTags(pageRequest.getTags());
            for (Tag tag : newTags) {
                page.addTag(tag);
            }
        }

        return pageRepository.save(page);
    }

    @Transactional
    public void deletePage(Long id) {
        pageRepository.deleteById(id);
    }

    private Set<Tag> findOrCreateTags(Set<String> tagNames) {
        Set<Tag> tags = new HashSet<>();
        for (String tagName : tagNames) {
            String normalizedName = tagName.toLowerCase().trim();
            Tag tag = tagRepository.findByNameIgnoreCase(normalizedName)
                    .orElseGet(() -> tagRepository.save(new Tag(normalizedName)));
            tags.add(tag);
        }
        return tags;
    }

}
