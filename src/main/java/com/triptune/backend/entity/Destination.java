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

    @NotBlank(message = "Budget level is required")
    @Size(max = 20, message = "Budget level must be at most 20 characters")
    @Column(name = "budget_level", nullable = false, length = 20)
    private String budgetLevel; // e.g. BUDGET, MID_RANGE, LUXURY

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
