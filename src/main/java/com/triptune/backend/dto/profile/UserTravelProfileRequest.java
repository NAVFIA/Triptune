package com.triptune.backend.dto.profile;

import java.time.LocalTime;
import java.util.Set;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

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
public class UserTravelProfileRequest {

    private Set<Mood> preferredMoods;
    
    private Set<Interest> interests;
    
    private TravellerType defaultTravellerType;
    
    private TravelPace preferredTravelPace;

    @Size(max = 100, message = "Preferred transport must be at most 100 characters")
    private String preferredTransport;

    @PositiveOrZero(message = "Maximum travel distance cannot be negative")
    private Double maximumTravelDistance;

    @Min(value = 1, message = "Crowd tolerance must be at least 1")
    @Max(value = 10, message = "Crowd tolerance must be at most 10")
    private Integer crowdTolerance;

    @PositiveOrZero(message = "Maximum walking distance cannot be negative")
    private Double maximumWalkingDistance;

    @Size(max = 500, message = "Dietary preferences must be at most 500 characters")
    private String dietaryPreferences;

    @Size(max = 500, message = "Accessibility requirements must be at most 500 characters")
    private String accessibilityRequirements;

    private LocalTime preferredWakeUpTime;
    
    private LocalTime preferredSleepTime;
}
