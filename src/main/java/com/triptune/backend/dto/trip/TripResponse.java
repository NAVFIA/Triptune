package com.triptune.backend.dto.trip;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Set;

import com.triptune.backend.dto.destination.DestinationResponse;
import com.triptune.backend.enums.BudgetFlexibility;
import com.triptune.backend.enums.Interest;
import com.triptune.backend.enums.Mood;
import com.triptune.backend.enums.TravelPace;
import com.triptune.backend.enums.TravellerType;
import com.triptune.backend.enums.TripStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TripResponse {

    private Long tripId;
    private Long creatorUserId;
    private String creatorFullName;

    private String tripName;
    private String startingLocation;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer numberOfDays;
    private Integer numberOfTravellers;
    private Integer numberOfAdults;
    private Integer numberOfChildren;
    private Integer numberOfElderly;

    private TravellerType travellerType;
    private TravelPace travelPace;
    private Set<Mood> moods;
    private Set<Interest> interests;

    private BigDecimal totalBudget;
    private BigDecimal perPersonBudget;
    private BudgetFlexibility budgetFlexibility;

    private String preferredTransport;
    private Double maximumTravelDistance;
    private String dietaryPreferences;
    private String accessibilityRequirements;
    private String activitiesToAvoid;

    private LocalTime preferredWakeUpTime;
    private LocalTime preferredSleepTime;
    private Integer crowdTolerance;
    private Double maximumWalkingDistance;

    private DestinationResponse selectedDestination;
    private TripStatus status;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
