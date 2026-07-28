package com.triptune.backend.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "destinations")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Destination {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Destination name is required")
    @Size(max = 150, message = "Destination name must be at most 150 characters")
    @Column(nullable = false, unique = true, length = 150)
    private String name;

    @NotBlank(message = "Country is required")
    @Size(max = 100, message = "Country name must be at most 100 characters")
    @Column(nullable = false, length = 100)
    private String country;

    @Size(max = 1000, message = "Description must be at most 1000 characters")
    @Column(length = 1000)
    private String description;

    @Size(max = 512, message = "Image URL must be at most 512 characters")
    @Column(name = "image_url", length = 512)
    private String imageUrl;

    @Size(max = 100, message = "State must be at most 100 characters")
    @Column(length = 100)
    private String state;

    @Column
    private Double latitude;

    @Column
    private Double longitude;

    @Column(name = "average_daily_cost")
    private Double averageDailyCost;

    @Column(name = "minimum_recommended_days")
    private Integer minimumRecommendedDays;

    @Column(name = "maximum_recommended_days")
    private Integer maximumRecommendedDays;

    @Column(name = "average_rating")
    private Double averageRating;

    @Size(max = 50, message = "Best season must be at most 50 characters")
    @Column(name = "best_season", length = 50)
    private String bestSeason;

    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @jakarta.persistence.OneToMany(mappedBy = "destination", cascade = jakarta.persistence.CascadeType.ALL, orphanRemoval = true)
    @com.fasterxml.jackson.annotation.JsonIgnore
    @lombok.Builder.Default
    private java.util.List<Activity> activities = new java.util.ArrayList<>();
}
