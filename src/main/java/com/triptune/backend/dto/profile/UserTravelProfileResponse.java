package com.triptune.backend.dto.profile;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Set;

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
public class UserTravelProfileResponse {

    private Long profileId;
    private Long userId;
    private String userFullName;
    private String userEmail;

    private Set<Mood> preferredMoods;
    private Set<Interest> interests;
    private TravellerType defaultTravellerType;
    private TravelPace preferredTravelPace;
    private String preferredTransport;
    private Double maximumTravelDistance;
    private Integer crowdTolerance;
    private Double maximumWalkingDistance;
    private String dietaryPreferences;
    private String accessibilityRequirements;
    private LocalTime preferredWakeUpTime;
    private LocalTime preferredSleepTime;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
