package com.triptune.backend.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.triptune.backend.dto.itinerary.ItineraryResponse;
import com.triptune.backend.dto.itinerary.ItineraryDayResponse;
import com.triptune.backend.dto.itinerary.ItineraryActivityResponse;
import com.triptune.backend.entity.Activity;
import com.triptune.backend.entity.Destination;
import com.triptune.backend.entity.Trip;
import com.triptune.backend.entity.User;
import com.triptune.backend.enums.Interest;
import com.triptune.backend.enums.Mood;
import com.triptune.backend.enums.TravelPace;
import com.triptune.backend.repository.TripRepository;
import com.triptune.backend.repository.ActivityRepository;
import com.triptune.backend.repository.UserRepository;

@Service
public class ItineraryService {

    private final TripRepository tripRepository;
    private final ActivityRepository activityRepository;
    private final UserRepository userRepository;

    public ItineraryService(TripRepository tripRepository, ActivityRepository activityRepository, UserRepository userRepository) {
        this.tripRepository = tripRepository;
        this.activityRepository = activityRepository;
        this.userRepository = userRepository;
    }

    private User getAuthenticatedUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Authenticated user not found"));
    }

    @Transactional(readOnly = true)
    public ItineraryResponse generateItinerary(Long tripId) {
        User user = getAuthenticatedUser();
        Trip trip = tripRepository.findByIdAndCreatedById(tripId, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Trip not found or you do not have access to it"));

        Destination destination = trip.getSelectedDestination();
        if (destination == null) {
            throw new IllegalArgumentException("No destination has been selected for this trip. Please select a destination first.");
        }

        List<Activity> allActivities = activityRepository.findByDestinationId(destination.getId());
        if (allActivities.isEmpty()) {
            throw new IllegalArgumentException("No activities are available for the selected destination: " + destination.getName());
        }

        // 1. Filter out activities matching 'activitiesToAvoid'
        List<Activity> filtered = filterActivities(trip, allActivities);

        // 2. Score and sort activities by preference match
        List<ScoredActivity> scoredPool = scoreActivities(trip, filtered);

        // 3. Build the day-by-day itinerary slots
        List<ItineraryDayResponse> days = new ArrayList<>();
        LocalDate currentDate = trip.getStartDate();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        
        Set<Long> usedIds = new HashSet<>();
        double totalCost = 0.0;

        int numActivitiesPerDay = getActivitiesCountPerDay(trip.getTravelPace());
        List<String> timeSlots = getTimeSlots(numActivitiesPerDay);
        List<String> startTimes = getStartTimes(numActivitiesPerDay);

        for (int d = 1; d <= trip.getNumberOfDays(); d++) {
            List<ItineraryActivityResponse> dayActivities = new ArrayList<>();

            for (int slot = 0; slot < numActivitiesPerDay; slot++) {
                Activity bestChoice = selectBestActivity(scoredPool, usedIds, trip, totalCost);
                if (bestChoice == null) {
                    // Recycle used activities if pool is small, to ensure slots aren't blank
                    usedIds.clear();
                    bestChoice = selectBestActivity(scoredPool, usedIds, trip, totalCost);
                }

                if (bestChoice != null) {
                    usedIds.add(bestChoice.getId());
                    int numTravellers = trip.getNumberOfTravellers() != null ? trip.getNumberOfTravellers() : 1;
                    totalCost += bestChoice.getEstimatedCost() * numTravellers;

                    dayActivities.add(ItineraryActivityResponse.builder()
                            .id(bestChoice.getId())
                            .name(bestChoice.getName())
                            .description(bestChoice.getDescription())
                            .durationMinutes(bestChoice.getDurationMinutes())
                            .estimatedCost(bestChoice.getEstimatedCost())
                            .timeSlot(timeSlots.get(slot))
                            .startTime(startTimes.get(slot))
                            .category(bestChoice.getCategory())
                            .build());
                }
            }

            days.add(ItineraryDayResponse.builder()
                    .dayNumber(d)
                    .date(currentDate.format(formatter))
                    .activities(dayActivities)
                    .build());

            currentDate = currentDate.plusDays(1);
        }

        return ItineraryResponse.builder()
                .tripId(trip.getId())
                .destinationId(destination.getId())
                .destinationName(destination.getName())
                .numberOfDays(trip.getNumberOfDays())
                .numberOfTravellers(trip.getNumberOfTravellers())
                .totalEstimatedCost(BigDecimal.valueOf(totalCost))
                .days(days)
                .build();
    }

    @Transactional
    public ItineraryResponse rejectActivity(Long tripId, Long activityId) {
        User user = getAuthenticatedUser();
        Trip trip = tripRepository.findByIdAndCreatedById(tripId, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Trip not found or you do not have access to it"));
        
        trip.getRejectedActivityIds().add(activityId);
        tripRepository.save(trip);
        
        return generateItinerary(tripId);
    }

    private List<Activity> filterActivities(Trip trip, List<Activity> activities) {
        String avoidText = trip.getActivitiesToAvoid() != null ? trip.getActivitiesToAvoid().toLowerCase() : "";
        boolean hasElderlyOrAccessibility = (trip.getNumberOfElderly() != null && trip.getNumberOfElderly() > 0) 
                || (trip.getAccessibilityRequirements() != null && !trip.getAccessibilityRequirements().trim().isEmpty());

        return activities.stream()
                .filter(act -> {
                    // Filter out rejected activities
                    if (trip.getRejectedActivityIds() != null && trip.getRejectedActivityIds().contains(act.getId())) {
                        return false;
                    }
                    // Filter categories to avoid
                    if (!avoidText.isEmpty() && act.getCategory() != null) {
                        if (avoidText.contains(act.getCategory().toLowerCase())) {
                            return false;
                        }
                    }
                    // Filter out HIGH energy if elderly passengers exist to prioritize safety
                    if (hasElderlyOrAccessibility && "high".equalsIgnoreCase(act.getEnergyLevel())) {
                        return false;
                    }
                    return act.getActive() != null && act.getActive();
                })
                .collect(Collectors.toList());
    }

    private List<ScoredActivity> scoreActivities(Trip trip, List<Activity> activities) {
        List<ScoredActivity> scored = new ArrayList<>();
        Set<Mood> moods = trip.getMoods();
        Set<Interest> interests = trip.getInterests();
        TravelPace pace = trip.getTravelPace();

        for (Activity act : activities) {
            double score = 10.0; // baseline

            // Category matching interest
            if (interests != null && act.getCategory() != null) {
                try {
                    Interest catInterest = Interest.valueOf(act.getCategory().toUpperCase());
                    if (interests.contains(catInterest)) {
                        score += 40.0;
                    }
                } catch (Exception ignored) {}
            }

            // Description keywords matching moods
            if (moods != null && act.getDescription() != null) {
                String desc = act.getDescription().toLowerCase();
                for (Mood m : moods) {
                    if (desc.contains(m.name().toLowerCase().replace("_", " "))) {
                        score += 20.0;
                    }
                }
            }

            // Energy level matching travel pace
            if (pace != null && act.getEnergyLevel() != null) {
                String energy = act.getEnergyLevel().trim().toLowerCase();
                if (pace == TravelPace.RELAXED && (energy.contains("low") || energy.contains("relaxed"))) {
                    score += 25.0;
                } else if (pace == TravelPace.PACKED && (energy.contains("high") || energy.contains("active"))) {
                    score += 25.0;
                } else if (pace == TravelPace.BALANCED && energy.contains("medium")) {
                    score += 25.0;
                }
            }

            // Rating
            if (act.getRating() != null) {
                score += (act.getRating() / 5.0) * 15.0;
            }

            scored.add(new ScoredActivity(act, score));
        }

        return scored.stream()
                .sorted(Comparator.comparing(ScoredActivity::getScore).reversed())
                .collect(Collectors.toList());
    }

    private Activity selectBestActivity(List<ScoredActivity> scoredPool, Set<Long> usedIds, Trip trip, double totalCost) {
        BigDecimal maxBudget = trip.getTotalBudget();
        double remainingBudget = maxBudget != null ? maxBudget.doubleValue() - totalCost : Double.MAX_VALUE;

        for (ScoredActivity scored : scoredPool) {
            Activity act = scored.getActivity();
            if (usedIds.contains(act.getId())) {
                continue;
            }
            
            // Check budget constraints
            int numTravellers = trip.getNumberOfTravellers() != null ? trip.getNumberOfTravellers() : 1;
            double estimatedCost = act.getEstimatedCost() * numTravellers;
            if (estimatedCost <= remainingBudget) {
                return act;
            }
        }
        return null;
    }

    private int getActivitiesCountPerDay(TravelPace pace) {
        if (pace == null) return 2;
        switch (pace) {
            case RELAXED:
                return 1;
            case PACKED:
                return 3;
            case BALANCED:
            default:
                return 2;
        }
    }

    private List<String> getTimeSlots(int count) {
        if (count == 1) {
            return List.of("Afternoon");
        } else if (count == 3) {
            return List.of("Morning", "Afternoon", "Evening");
        } else {
            return List.of("Morning", "Afternoon");
        }
    }

    private List<String> getStartTimes(int count) {
        if (count == 1) {
            return List.of("14:00");
        } else if (count == 3) {
            return List.of("09:30", "14:00", "19:00");
        } else {
            return List.of("10:00", "14:30");
        }
    }

    private static class ScoredActivity {
        private final Activity activity;
        private final double score;

        ScoredActivity(Activity activity, double score) {
            this.activity = activity;
            this.score = score;
        }

        Activity getActivity() {
            return activity;
        }

        double getScore() {
            return score;
        }
    }
}
