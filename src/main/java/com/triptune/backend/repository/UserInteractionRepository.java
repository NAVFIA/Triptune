package com.triptune.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.triptune.backend.entity.UserInteraction;

@Repository
public interface UserInteractionRepository extends JpaRepository<UserInteraction, Long> {
}
