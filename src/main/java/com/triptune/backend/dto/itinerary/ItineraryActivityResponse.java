package com.triptune.backend.dto.itinerary;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItineraryActivityResponse {
    private Long id;
    private String name;
    private String description;
    private Integer durationMinutes;
    private Double estimatedCost;
    private String timeSlot; // Morning, Afternoon, Evening
    private String startTime;
    private String category;
}
