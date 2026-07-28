package com.triptune.backend.service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.triptune.backend.dto.recommendation.DestinationRecommendationResponse;
import com.triptune.backend.entity.Activity;
import com.triptune.backend.entity.Destination;
import com.triptune.backend.entity.Trip;
import com.triptune.backend.entity.User;
import com.triptune.backend.entity.UserTravelProfile;
import com.triptune.backend.enums.Interest;
import com.triptune.backend.enums.Mood;
import com.triptune.backend.enums.TravellerType;
import com.triptune.backend.enums.TripStatus;
import com.triptune.backend.repository.DestinationRepository;
import com.triptune.backend.repository.TripRepository;
import com.triptune.backend.repository.UserRepository;
import com.triptune.backend.repository.UserTravelProfileRepository;

@Service
public class DestinationRecommendationService {

    private final TripRepository tripRepository;
    private final DestinationRepository destinationRepository;
    private final UserRepository userRepository;
    private final UserTravelProfileRepository profileRepository;

    public DestinationRecommendationService(
            TripRepository tripRepository,
            DestinationRepository destinationRepository,
            UserRepository userRepository,
            UserTravelProfileRepository profileRepository) {
        this.tripRepository = tripRepository;
        this.destinationRepository = destinationRepository;
        this.userRepository = userRepository;
        this.profileRepository = profileRepository;
    }

    private User getAuthenticatedUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Authenticated user not found"));
    }

    @Transactional
    public List<DestinationRecommendationResponse> recommendDestinationsForTrip(Long tripId) {
        User user = getAuthenticatedUser();
        Trip trip = tripRepository.findByIdAndCreatedById(tripId, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Trip not found or you do not have permission to access it"));

        UserTravelProfile profile = profileRepository.findByUserId(user.getId()).orElse(null);

        List<Destination> activeDestinations = destinationRepository.findAll().stream()
                .filter(d -> d.getActive() != null && d.getActive())
                .collect(Collectors.toList());

        List<DestinationRecommendationResponse> recommendations = new ArrayList<>();

        for (Destination dest : activeDestinations) {
            recommendations.add(calculateScore(trip, profile, dest));
        }

        List<DestinationRecommendationResponse> topRecommendations = recommendations.stream()
                .sorted(Comparator.comparing(DestinationRecommendationResponse::getOverallScore).reversed())
                .limit(5)
                .collect(Collectors.toList());

        trip.setStatus(TripStatus.DESTINATION_RECOMMENDED);
        tripRepository.save(trip);

        return topRecommendations;
    }

    private DestinationRecommendationResponse calculateScore(Trip trip, UserTravelProfile profile, Destination dest) {
        double moodScore = calculateMoodScore(trip, profile, dest);
        double interestScore = calculateInterestScore(trip, dest);
        double budgetScore = calculateBudgetScore(trip, dest);
        double groupScore = calculateGroupCompatibilityScore(trip, dest);
        double ratingScore = calculateRatingScore(dest);
        double distanceScore = calculateDistanceScore(trip, dest);
        double profileScore = calculateProfileScore(trip, profile);

        double overallScore = (0.25 * moodScore)
                + (0.20 * groupScore)
                + (0.15 * interestScore)
                + (0.15 * budgetScore)
                + (0.10 * ratingScore)
                + (0.05 * distanceScore)
                + (0.10 * profileScore);

        List<String> reasons = new ArrayList<>();
        List<String> risks = new ArrayList<>();

        if (budgetScore > 80) reasons.add("Fits well within your budget.");
        else if (budgetScore < 50) risks.add("Estimated cost may exceed budget.");

        if (interestScore > 70) reasons.add("Strong match for your selected interests.");
        else if (interestScore < 30) risks.add("Limited activities matching selected interests.");

        if (moodScore > 70) reasons.add("Great match for your desired mood.");
        if (ratingScore > 80) reasons.add("Highly rated by other travellers.");

        BigDecimal estCostPerPerson = BigDecimal.ZERO;
        if (dest.getAverageDailyCost() != null) {
            estCostPerPerson = BigDecimal.valueOf(dest.getAverageDailyCost() * trip.getNumberOfDays());
        }

        return DestinationRecommendationResponse.builder()
                .destinationId(dest.getId())
                .destinationName(dest.getName())
                .state(dest.getState())
                .country(dest.getCountry())
                .description(dest.getDescription())
                .imageUrl(dest.getImageUrl())
                .moodMatchScore(moodScore)
                .groupCompatibilityScore(groupScore)
                .interestMatchScore(interestScore)
                .budgetMatchScore(budgetScore)
                .distanceConvenienceScore(distanceScore)
                .ratingScore(ratingScore)
                .profileCompatibilityScore(profileScore)
                .overallScore(overallScore)
                .estimatedCostPerPerson(estCostPerPerson)
                .recommendationReasons(reasons)
                .possibleRisks(risks)
                .build();
    }

    private double calculateMoodScore(Trip trip, UserTravelProfile profile, Destination dest) {
        Set<Mood> targetMoods = trip.getMoods();
        if (targetMoods == null || targetMoods.isEmpty()) {
            if (profile != null && profile.getPreferredMoods() != null) {
                targetMoods = profile.getPreferredMoods();
            }
        }
        
        if (targetMoods == null || targetMoods.isEmpty()) return 50.0;
        
        // Simple rule based on matching keywords in description (mock algorithm)
        int matches = 0;
        String desc = dest.getDescription() != null ? dest.getDescription().toLowerCase() : "";
        for (Mood m : targetMoods) {
            if (desc.contains(m.name().toLowerCase().replace("_", " "))) {
                matches++;
            }
        }
        double score = (matches / (double) targetMoods.size()) * 100.0;
        return Math.max(20.0, score); // baseline
    }

    private double calculateInterestScore(Trip trip, Destination dest) {
        Set<Interest> interests = trip.getInterests();
        if (interests == null || interests.isEmpty()) return 50.0;
        
        long matches = 0;
        if (dest.getActivities() != null) {
            for (Activity act : dest.getActivities()) {
                if (act.getCategory() != null) {
                    try {
                        Interest actInterest = Interest.valueOf(act.getCategory().toUpperCase());
                        if (interests.contains(actInterest)) matches++;
                    } catch (Exception ignored) {}
                }
            }
        }
        double score = matches > 0 ? Math.min(100.0, (matches * 20.0)) : 20.0;
        return score;
    }

    private double calculateBudgetScore(Trip trip, Destination dest) {
        if (trip.getPerPersonBudget() == null || dest.getAverageDailyCost() == null) return 50.0;
        
        double estimatedCost = dest.getAverageDailyCost() * trip.getNumberOfDays();
        double budget = trip.getPerPersonBudget().doubleValue();
        
        if (estimatedCost <= budget) return 100.0;
        
        double ratio = estimatedCost / budget;
        if (ratio < 1.1) return 80.0;
        if (ratio < 1.25) return 50.0;
        return 10.0;
    }

    private double calculateGroupCompatibilityScore(Trip trip, Destination dest) {
        TravellerType type = trip.getTravellerType();
        if (type == null) return 50.0;
        
        String desc = dest.getDescription() != null ? dest.getDescription().toLowerCase() : "";
        
        if (type == TravellerType.FAMILY || type == TravellerType.PARENTS_WITH_CHILDREN) {
            if (desc.contains("family") || desc.contains("kids") || desc.contains("safe")) return 90.0;
            return 60.0;
        } else if (type == TravellerType.COUPLE) {
            if (desc.contains("romantic") || desc.contains("scenic")) return 90.0;
            return 60.0;
        }
        
        return 70.0;
    }

    private double calculateRatingScore(Destination dest) {
        if (dest.getAverageRating() == null) return 50.0;
        return (dest.getAverageRating() / 5.0) * 100.0;
    }

    private double calculateDistanceScore(Trip trip, Destination dest) {
        // Distance unavailable in current data set. Use maximumTravelDistance as neutral score.
        return 50.0;
    }

    private double calculateProfileScore(Trip trip, UserTravelProfile profile) {
        if (profile == null) return 50.0;
        // Basic compatibility score
        return 80.0;
    }
}
