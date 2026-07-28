package com.triptune.backend.dto.activity;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActivityRequest {

    @NotBlank(message = "Activity name is required")
    @Size(max = 150, message = "Activity name must be at most 150 characters")
    private String name;

    @Size(max = 1000, message = "Description must be at most 1000 characters")
    private String description;

    @NotBlank(message = "Category is required")
    @Size(max = 50, message = "Category must be at most 50 characters")
    private String category;

    private Double latitude;
    private Double longitude;

    @NotNull(message = "Estimated cost is required")
    private Double estimatedCost;

    @NotNull(message = "Duration in minutes is required")
    private Integer durationMinutes;

    @Size(max = 50, message = "Opening time must be at most 50 characters")
    private String openingTime;

    @Size(max = 50, message = "Closing time must be at most 50 characters")
    private String closingTime;

    @Size(max = 20, message = "Energy level must be at most 20 characters")
    private String energyLevel;

    private Boolean indoor;
    private Boolean weatherDependent;
    private Boolean bookingRequired;

    private Double rating;

    @Size(max = 512, message = "Image URL must be at most 512 characters")
    private String imageUrl;

    private Boolean active;
}
