package com.triptune.backend.dto.destination;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DestinationRequest {

    @NotBlank(message = "Destination name is required")
    @Size(max = 150, message = "Destination name must be at most 150 characters")
    private String name;

    @Size(max = 100, message = "State must be at most 100 characters")
    private String state;

    @NotBlank(message = "Country is required")
    @Size(max = 100, message = "Country name must be at most 100 characters")
    private String country;

    @Size(max = 1000, message = "Description must be at most 1000 characters")
    private String description;

    private Double latitude;
    private Double longitude;
    private Double averageDailyCost;
    private Integer minimumRecommendedDays;
    private Integer maximumRecommendedDays;
    private Double averageRating;

    @Size(max = 512, message = "Image URL must be at most 512 characters")
    private String imageUrl;

    @Size(max = 50, message = "Best season must be at most 50 characters")
    private String bestSeason;

    private Boolean active;
}
