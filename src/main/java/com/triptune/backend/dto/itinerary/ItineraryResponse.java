package com.triptune.backend.dto.itinerary;

import java.math.BigDecimal;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItineraryResponse {
    private Long tripId;
    private Long destinationId;
    private String destinationName;
    private Integer numberOfDays;
    private Integer numberOfTravellers;
    private BigDecimal totalEstimatedCost;
    private List<ItineraryDayResponse> days;
}
