package com.triptune.backend.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.triptune.backend.entity.Trip;

@Repository
public interface TripRepository extends JpaRepository<Trip, Long> {

    Page<Trip> findByCreatedById(Long userId, Pageable pageable);

    Optional<Trip> findByIdAndCreatedById(Long tripId, Long userId);

    boolean existsByIdAndCreatedById(Long tripId, Long userId);
}
