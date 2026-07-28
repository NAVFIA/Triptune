package com.triptune.backend.dto.activity;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActivityResponse {

    private Long id;
    private Long destinationId;
    private String name;
    private String description;
    private String category;
    private Double latitude;
    private Double longitude;
    private Double estimatedCost;
    private Integer durationMinutes;
    private String openingTime;
    private String closingTime;
    private String energyLevel;
    private Boolean indoor;
    private Boolean weatherDependent;
    private Boolean bookingRequired;
    private Double rating;
    private String imageUrl;
    private Boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
