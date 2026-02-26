package com.personalwiki.repository;

import com.personalwiki.model.Page;
import com.personalwiki.model.Type;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PageRepository extends JpaRepository<Page, Long> {

    // Force fetch tags with JOIN FETCH
    @Query("SELECT DISTINCT p FROM Page p LEFT JOIN FETCH p.tags LEFT JOIN FETCH p.type")
    List<Page> findAllWithTags();

    @Query("SELECT p FROM Page p LEFT JOIN FETCH p.tags LEFT JOIN FETCH p.type WHERE p.id = :id")
    Optional<Page> findByIdWithTags(@Param("id") Long id);

    // Find by type with tags
    @Query("SELECT DISTINCT p FROM Page p LEFT JOIN FETCH p.tags LEFT JOIN FETCH p.type WHERE p.type = :type")
    List<Page> findByTypeWithTags(@Param("type") Type type);

    // Search by title (content)
    List<Page> findByTitleContainingIgnoreCase(String title);

    // Search in the content
    List<Page> findByContentContainingIgnoreCase(String content);

    @Modifying
    @Query("UPDATE Page p SET p.type = null WHERE p.type.id = :typeId")
    void clearTypeFromPages(@Param("typeId") Long typeId);

    long countByTypeId(Long typeId);
}
