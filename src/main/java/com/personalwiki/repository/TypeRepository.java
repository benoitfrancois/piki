package com.personalwiki.repository;

import com.personalwiki.model.Type;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TypeRepository extends JpaRepository<Type, Long> {

    Optional<Type> findByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCase(String name);
}
