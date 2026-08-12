package com.triptune.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.triptune.backend.entity.TripExpense;

@Repository
public interface TripExpenseRepository extends JpaRepository<TripExpense, Long> {
    List<TripExpense> findByTripIdOrderByCreatedAtDesc(Long tripId);
}
