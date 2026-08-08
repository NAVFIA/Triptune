package com.triptune.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.triptune.backend.entity.Destination;
import java.util.Optional;

@Repository
public interface DestinationRepository extends JpaRepository<Destination, Long> {

    boolean existsByName(String name);
    Optional<Destination> findByName(String name);
}
