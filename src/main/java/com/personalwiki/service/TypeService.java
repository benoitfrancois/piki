package com.personalwiki.service;

import com.personalwiki.model.Type;
import com.personalwiki.repository.TypeRepository;
import jakarta.annotation.PostConstruct;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TypeService {

    @Autowired
    private TypeRepository typeRepository;

    /**
     * Populate the database with the 5 default types if it is empty.
     * Only runs on first start-up.
     */
    @PostConstruct
    public void initDefaultTypes() {
        if (typeRepository.count() == 0) {
            typeRepository.save(new Type("Definition", "blue",    "📖"));
            typeRepository.save(new Type("Diagram",     "green",   "🗂️"));
            typeRepository.save(new Type("Workflow",   "purple",  "🔄"));
            typeRepository.save(new Type("Maintenance","red",     "🔧"));
            typeRepository.save(new Type("Other",      "gray",    "📄"));
        }
    }

    public List<Type> getAllTypes() {
        return typeRepository.findAll();
    }

    public Optional<Type> getTypeById(Long id) {
        return typeRepository.findById(id);
    }

    @Transactional
    public Type createType(String name, String color, String icon) {
        if (typeRepository.existsByNameIgnoreCase(name)) {
            throw new IllegalArgumentException("The type '" + name + "' already exists");
        }
        return typeRepository.save(new Type(name.trim(), color, icon));
    }

    @Transactional
    public Type updateType(Long id, String name, String color, String icon) {
        Type type = typeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Type not found : " + id));

        // Check name uniqueness only if the name changes
        if (!type.getName().equalsIgnoreCase(name)
                && typeRepository.existsByNameIgnoreCase(name)) {
            throw new IllegalArgumentException("Le type '" + name + "' already exists");
        }

        type.setName(name.trim());
        type.setColor(color);
        type.setIcon(icon);
        return typeRepository.save(type);
    }

    @Transactional
    public void deleteType(Long id) {
        Type type = typeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Type not found : " + id));
        // Associated pages will have their type set to null (nullable = true in Page)
        typeRepository.delete(type);
    }
}
