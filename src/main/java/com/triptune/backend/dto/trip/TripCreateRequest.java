package com.triptune.backend.dto.trip;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Set;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import com.triptune.backend.enums.BudgetFlexibility;
import com.triptune.backend.enums.Interest;
import com.triptune.backend.enums.Mood;
import com.triptune.backend.enums.TravelPace;
import com.triptune.backend.enums.TravellerType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TripCreateRequest {

    @NotBlank(message = "Trip name is required")
    @Size(max = 150, message = "Trip name must be at most 150 characters")
    private String tripName;

    @NotBlank(message = "Starting location is required")
    @Size(max = 150, message = "Starting location must be at most 150 characters")
    private String startingLocation;

    @NotNull(message = "Start date is required")
    @FutureOrPresent(message = "Start date must not be in the past")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    private LocalDate endDate;

    @Min(value = 1, message = "Number of travellers must be at least 1")
    private Integer numberOfTravellers;

    @PositiveOrZero
    private Integer numberOfAdults;

    @PositiveOrZero
    private Integer numberOfChildren;

    @PositiveOrZero
    private Integer numberOfElderly;

    private TravellerType travellerType;
    private TravelPace travelPace;
    private Set<Mood> moods;
    private Set<Interest> interests;

    @PositiveOrZero(message = "Budget cannot be negative")
    private BigDecimal totalBudget;

    @PositiveOrZero(message = "Budget cannot be negative")
    private BigDecimal perPersonBudget;

    private BudgetFlexibility budgetFlexibility;

    @Size(max = 100, message = "Preferred transport must be at most 100 characters")
    private String preferredTransport;

    @PositiveOrZero(message = "Maximum travel distance cannot be negative")
    private Double maximumTravelDistance;

    @Size(max = 500, message = "Dietary preferences must be at most 500 characters")
    private String dietaryPreferences;

    @Size(max = 500, message = "Accessibility requirements must be at most 500 characters")
    private String accessibilityRequirements;

    @Size(max = 1000, message = "Activities to avoid must be at most 1000 characters")
    private String activitiesToAvoid;

    private LocalTime preferredWakeUpTime;
    private LocalTime preferredSleepTime;

    @Min(value = 1, message = "Crowd tolerance must be at least 1")
    @Max(value = 10, message = "Crowd tolerance must be at most 10")
    private Integer crowdTolerance;

    @PositiveOrZero(message = "Maximum walking distance cannot be negative")
    private Double maximumWalkingDistance;
}
