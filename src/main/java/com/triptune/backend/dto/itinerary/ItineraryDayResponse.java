package com.triptune.backend.dto.itinerary;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItineraryDayResponse {
    private Integer dayNumber;
    private String date; // LocalDate formatted
    private List<ItineraryActivityResponse> activities;
}
