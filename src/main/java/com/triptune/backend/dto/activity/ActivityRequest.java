package com.triptune.backend.dto.activity;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
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

    @NotNull(message = "Duration in minutes is required")
    @Positive(message = "Duration must be greater than zero")
    private Integer durationMinutes;

    @NotNull(message = "Cost is required")
    @PositiveOrZero(message = "Cost must be a positive number or zero")
    private Double cost;

    @Size(max = 50, message = "Opening hours must be at most 50 characters")
    private String openingHours;

    @Size(max = 50, message = "Closing hours must be at most 50 characters")
    private String closingHours;

    @NotBlank(message = "Category is required")
    @Size(max = 50, message = "Category must be at most 50 characters")
    private String category;

    @NotNull(message = "Destination ID is required")
    private Long destinationId;
}
