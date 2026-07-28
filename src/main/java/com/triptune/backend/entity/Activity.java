package com.triptune.backend.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "activities")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Activity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Activity name is required")
    @Size(max = 150, message = "Activity name must be at most 150 characters")
    @Column(nullable = false, length = 150)
    private String name;

    @Size(max = 1000, message = "Description must be at most 1000 characters")
    @Column(length = 1000)
    private String description;

    @NotNull(message = "Duration in minutes is required")
    @Column(name = "duration_minutes", nullable = false)
    private Integer durationMinutes;

    @Column
    private Double latitude;

    @Column
    private Double longitude;

    @NotNull(message = "Estimated cost is required")
    @Column(name = "estimated_cost", nullable = false)
    private Double estimatedCost;

    @Column(name = "opening_time", length = 50)
    private String openingTime;

    @Column(name = "closing_time", length = 50)
    private String closingTime;

    @Size(max = 20, message = "Energy level must be at most 20 characters")
    @Column(name = "energy_level", length = 20)
    private String energyLevel;

    @Column(nullable = false)
    @Builder.Default
    private Boolean indoor = false;

    @Column(name = "weather_dependent", nullable = false)
    @Builder.Default
    private Boolean weatherDependent = false;

    @Column(name = "booking_required", nullable = false)
    @Builder.Default
    private Boolean bookingRequired = false;

    @Column
    private Double rating;

    @Size(max = 512, message = "Image URL must be at most 512 characters")
    @Column(name = "image_url", length = 512)
    private String imageUrl;

    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;

    @NotBlank(message = "Category is required")
    @Size(max = 50, message = "Category must be at most 50 characters")
    @Column(nullable = false, length = 50)
    private String category;

    @ManyToOne
    @JoinColumn(name = "destination_id", nullable = false)
    private Destination destination;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
