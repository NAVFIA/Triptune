package com.triptune.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "user_interactions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserInteraction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "mood_match_score", nullable = false)
    private Double moodMatchScore;

    @Column(name = "pace_compatibility_score", nullable = false)
    private Double paceCompatibilityScore;

    @Column(name = "budget_match_score", nullable = false)
    private Double budgetMatchScore;

    @Column(name = "distance_score", nullable = false)
    private Double distanceScore;

    @Column(name = "group_score", nullable = false)
    private Double groupScore;

    @Column(name = "rating_score", nullable = false)
    private Double ratingScore;

    @Column(nullable = false)
    private Double selected; // 1.0 (Selected) or 0.0 (Ignored)
}
