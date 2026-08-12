package com.triptune.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.triptune.backend.entity.TripPhoto;

@Repository
public interface TripPhotoRepository extends JpaRepository<TripPhoto, Long> {
    List<TripPhoto> findByTripIdOrderByCreatedAtDesc(Long tripId);
}
