package com.triptune.backend.dto.group;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TripPhotoCreateRequest {

    @NotBlank(message = "Image URL is required")
    private String imageUrl;

    @Size(max = 255, message = "Caption must be at most 255 characters")
    private String caption;

    @NotNull(message = "Day number is required")
    @Min(value = 1, message = "Day number must be at least 1")
    private Integer dayNumber;

    @NotBlank(message = "Place/Activity name is required")
    private String activityName;
}
