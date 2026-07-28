package com.triptune.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.triptune.backend.entity.UserTravelProfile;

@Repository
public interface UserTravelProfileRepository extends JpaRepository<UserTravelProfile, Long> {

    Optional<UserTravelProfile> findByUserId(Long userId);

    Optional<UserTravelProfile> findByUserEmail(String email);

    boolean existsByUserId(Long userId);
}
