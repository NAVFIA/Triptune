package com.triptune.backend.service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.HashSet;
import java.util.HashMap;
import java.util.Map;
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
import com.triptune.backend.entity.UserInteraction;
import com.triptune.backend.enums.Interest;
import com.triptune.backend.enums.Mood;
import com.triptune.backend.enums.TravellerType;
import com.triptune.backend.enums.TripStatus;
import com.triptune.backend.enums.TravelPace;
import com.triptune.backend.enums.BudgetFlexibility;
import com.triptune.backend.repository.DestinationRepository;
import com.triptune.backend.repository.TripRepository;
import com.triptune.backend.repository.UserRepository;
import com.triptune.backend.repository.UserTravelProfileRepository;
import com.triptune.backend.repository.UserInteractionRepository;

import weka.core.Attribute;
import weka.core.DenseInstance;
import weka.core.Instance;
import weka.core.Instances;
import weka.classifiers.trees.RandomForest;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class DestinationRecommendationService {

    private final TripRepository tripRepository;
    private final DestinationRepository destinationRepository;
    private final UserRepository userRepository;
    private final UserTravelProfileRepository profileRepository;
    private final UserInteractionRepository userInteractionRepository;

    // Resolve popular starting locations to coordinates
    private static class Coordinate {
        final double latitude;
        final double longitude;

        Coordinate(double latitude, double longitude) {
            this.latitude = latitude;
            this.longitude = longitude;
        }
    }

    private static final Map<String, Coordinate> CITIES_COORDINATES = new HashMap<>();
    static {
        CITIES_COORDINATES.put("new york", new Coordinate(40.7128, -74.0060));
        CITIES_COORDINATES.put("nyc", new Coordinate(40.7128, -74.0060));
        CITIES_COORDINATES.put("los angeles", new Coordinate(34.0522, -118.2437));
        CITIES_COORDINATES.put("la", new Coordinate(34.0522, -118.2437));
        CITIES_COORDINATES.put("chicago", new Coordinate(41.8781, -87.6298));
        CITIES_COORDINATES.put("san francisco", new Coordinate(37.7749, -122.4194));
        CITIES_COORDINATES.put("sf", new Coordinate(37.7749, -122.4194));
        CITIES_COORDINATES.put("miami", new Coordinate(25.7617, -80.1918));
        CITIES_COORDINATES.put("london", new Coordinate(51.5074, -0.1278));
        CITIES_COORDINATES.put("paris", new Coordinate(48.8566, 2.3522));
        CITIES_COORDINATES.put("tokyo", new Coordinate(35.6762, 139.6503));
        CITIES_COORDINATES.put("sydney", new Coordinate(-33.8688, 151.2093));
        CITIES_COORDINATES.put("berlin", new Coordinate(52.5200, 13.4050));
        CITIES_COORDINATES.put("rome", new Coordinate(41.9028, 12.4964));
        CITIES_COORDINATES.put("cairo", new Coordinate(30.0444, 31.2357));
        CITIES_COORDINATES.put("mumbai", new Coordinate(19.0760, 72.8777));
        CITIES_COORDINATES.put("delhi", new Coordinate(28.6139, 77.2090));
        CITIES_COORDINATES.put("bangalore", new Coordinate(12.9716, 77.5946));
        CITIES_COORDINATES.put("boston", new Coordinate(42.3601, -71.0589));
        CITIES_COORDINATES.put("seattle", new Coordinate(47.6062, -122.3321));
        CITIES_COORDINATES.put("denver", new Coordinate(39.7392, -104.9903));
        CITIES_COORDINATES.put("austin", new Coordinate(30.2672, -97.7431));
    }

    public DestinationRecommendationService(
            TripRepository tripRepository,
            DestinationRepository destinationRepository,
            UserRepository userRepository,
            UserTravelProfileRepository profileRepository,
            UserInteractionRepository userInteractionRepository) {
        this.tripRepository = tripRepository;
        this.destinationRepository = destinationRepository;
        this.userRepository = userRepository;
        this.profileRepository = profileRepository;
        this.userInteractionRepository = userInteractionRepository;
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

        // 1. Fetch historical/Kaggle logs from the database
        List<UserInteraction> logs = userInteractionRepository.findAll();
        if (logs.isEmpty()) {
            log.warn("No user interaction logs found for training! Falling back to baseline calculations.");
        }

        // 2. Train the Weka RandomForest Model using these logs
        RandomForest model = null;
        Instances datasetStructure = null;
        ArrayList<Attribute> attributes = null;
        ArrayList<String> classValues = null;

        if (!logs.isEmpty()) {
            try {
                // Setup features
                attributes = new ArrayList<>();
                attributes.add(new Attribute("moodMatchScore"));
                attributes.add(new Attribute("paceCompatibilityScore"));
                attributes.add(new Attribute("budgetMatchScore"));
                attributes.add(new Attribute("distanceScore"));
                attributes.add(new Attribute("groupScore"));
                attributes.add(new Attribute("ratingScore"));

                // Target classification label (0.0 or 1.0)
                classValues = new ArrayList<>();
                classValues.add("0.0");
                classValues.add("1.0");
                attributes.add(new Attribute("selected", classValues));

                // Create dataset instances
                datasetStructure = new Instances("TravelRecommendationRF", attributes, logs.size());
                datasetStructure.setClassIndex(6);

                for (UserInteraction logEntry : logs) {
                    DenseInstance inst = new DenseInstance(7);
                    inst.setValue(attributes.get(0), logEntry.getMoodMatchScore());
                    inst.setValue(attributes.get(1), logEntry.getPaceCompatibilityScore());
                    inst.setValue(attributes.get(2), logEntry.getBudgetMatchScore());
                    inst.setValue(attributes.get(3), logEntry.getDistanceScore());
                    inst.setValue(attributes.get(4), logEntry.getGroupScore());
                    inst.setValue(attributes.get(5), logEntry.getRatingScore());
                    inst.setValue(attributes.get(6), logEntry.getSelected() == 1.0 ? 1 : 0);
                    datasetStructure.add(inst);
                }

                // Train classifier
                model = new RandomForest();
                model.buildClassifier(datasetStructure);
                log.info("Successfully trained Weka RandomForest model on {} logs.", logs.size());

            } catch (Exception e) {
                log.error("Failed to train Weka RandomForest model: ", e);
                model = null; // Fallback
            }
        }

        List<DestinationRecommendationResponse> recommendations = new ArrayList<>();

        for (Destination dest : activeDestinations) {
            recommendations.add(calculateScore(trip, profile, dest, model, datasetStructure, attributes));
        }

        List<DestinationRecommendationResponse> topRecommendations = recommendations.stream()
                .sorted(Comparator.comparing(DestinationRecommendationResponse::getOverallScore).reversed())
                .limit(5)
                .collect(Collectors.toList());

        trip.setStatus(TripStatus.DESTINATION_RECOMMENDED);
        tripRepository.save(trip);

        return topRecommendations;
    }

    private DestinationRecommendationResponse calculateScore(Trip trip, UserTravelProfile profile, Destination dest, RandomForest model, Instances datasetStructure, ArrayList<Attribute> attributes) {
        double moodScore = calculateMoodScore(trip, profile, dest);
        double interestScore = calculateInterestScore(trip, dest);
        double budgetScore = calculateBudgetScore(trip, dest);
        double groupScore = calculateGroupCompatibilityScore(trip, dest);
        double ratingScore = calculateRatingScore(dest);
        double distanceScore = calculateDistanceScore(trip, dest);
        double profileScore = calculateProfileScore(trip, profile);
        double paceScore = calculatePaceCompatibilityScore(trip, dest);

        double overallScore = 0.0;

        // 3. Make prediction using Weka RandomForest if trained, otherwise fallback to heuristics
        if (model != null && datasetStructure != null && attributes != null) {
            try {
                DenseInstance queryInstance = new DenseInstance(7);
                queryInstance.setDataset(datasetStructure);
                queryInstance.setValue(attributes.get(0), moodScore);
                queryInstance.setValue(attributes.get(1), paceScore);
                queryInstance.setValue(attributes.get(2), budgetScore);
                queryInstance.setValue(attributes.get(3), distanceScore);
                queryInstance.setValue(attributes.get(4), groupScore);
                queryInstance.setValue(attributes.get(5), ratingScore);
                queryInstance.setMissing(6);

                double[] distribution = model.distributionForInstance(queryInstance);
                // Class probability of '1.0' (Selected)
                overallScore = distribution[1] * 100.0;
            } catch (Exception e) {
                log.warn("Error running RandomForest classifier inference, using fallback scoring: ", e);
                overallScore = (0.25 * moodScore) + (0.20 * paceScore) + (0.20 * budgetScore) + (0.15 * ratingScore) + (0.10 * distanceScore) + (0.10 * groupScore);
            }
        } else {
            // Fallback heuristics
            overallScore = (0.25 * moodScore) + (0.20 * paceScore) + (0.20 * budgetScore) + (0.15 * ratingScore) + (0.10 * distanceScore) + (0.10 * groupScore);
        }

        List<String> reasons = new ArrayList<>();
        List<String> risks = new ArrayList<>();

        // Generate descriptive reasons/risks
        if (budgetScore >= 80) {
            reasons.add("Fits well within your budget.");
        } else if (budgetScore < 50) {
            risks.add("Estimated daily expenses may exceed your budget.");
        }

        if (interestScore >= 70) {
            reasons.add("Strong match for your selected interests.");
        } else if (interestScore < 30) {
            risks.add("Limited activities matching your selected interests.");
        }

        if (moodScore >= 70) {
            reasons.add("Matches your desired mood indicators.");
        }
        
        if (paceScore >= 75) {
            reasons.add("Aligns perfectly with your preferred travel pace.");
        } else if (paceScore < 40) {
            risks.add("Pace of activities at this spot might not align with your schedule.");
        }

        if (ratingScore >= 80) {
            reasons.add("Highly rated by other travellers.");
        }

        if (distanceScore >= 80 && trip.getMaximumTravelDistance() != null) {
            reasons.add("Convenient travel distance from starting location.");
        } else if (distanceScore < 40) {
            risks.add("Exceeds your preferred maximum travel distance.");
        }

        if (groupScore >= 80) {
            reasons.add("Excellent safety and compatibility match for the group composition.");
        } else if (groupScore < 50) {
            risks.add("Might have limited suitable facilities/activities for children or elderly.");
        }

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

    /**
     * Records positive and negative user interaction loops to grow the Random Forest training dataset.
     */
    @Transactional
    public void recordInteraction(Trip trip, Long selectedDestId) {
        try {
            UserTravelProfile profile = profileRepository.findByUserId(trip.getCreatedBy().getId()).orElse(null);
            
            // Fetch all active destinations as candidates
            List<Destination> activeDestinations = destinationRepository.findAll().stream()
                    .filter(d -> d.getActive() != null && d.getActive())
                    .collect(Collectors.toList());

            log.info("Logging trip choice interactions for User: {} and Trip: {}", trip.getCreatedBy().getId(), trip.getId());

            for (Destination dest : activeDestinations) {
                double moodScore = calculateMoodScore(trip, profile, dest);
                double budgetScore = calculateBudgetScore(trip, dest);
                double groupScore = calculateGroupCompatibilityScore(trip, dest);
                double ratingScore = calculateRatingScore(dest);
                double distanceScore = calculateDistanceScore(trip, dest);
                double paceScore = calculatePaceCompatibilityScore(trip, dest);
                
                double selectedLabel = dest.getId().equals(selectedDestId) ? 1.0 : 0.0;
                
                // Record the selected one (Positive, selected = 1.0)
                // And sample some ignored candidates (Negative, selected = 0.0) to maintain balanced data ratio
                if (selectedLabel == 1.0 || (Math.random() < 0.25)) {
                    UserInteraction interaction = UserInteraction.builder()
                            .moodMatchScore(moodScore)
                            .paceCompatibilityScore(paceScore)
                            .budgetMatchScore(budgetScore)
                            .distanceScore(distanceScore)
                            .groupScore(groupScore)
                            .ratingScore(ratingScore)
                            .selected(selectedLabel)
                            .build();
                    userInteractionRepository.save(interaction);
                }
            }
            log.info("Logged interaction loop successfully.");
        } catch (Exception e) {
            log.error("Failed to log user trip interactions: ", e);
        }
    }

    // Jaccard similarity for mood keyword overlap
    private double calculateMoodScore(Trip trip, UserTravelProfile profile, Destination dest) {
        Set<Mood> targetMoods = trip.getMoods();
        if (targetMoods == null || targetMoods.isEmpty()) {
            if (profile != null && profile.getPreferredMoods() != null) {
                targetMoods = profile.getPreferredMoods();
            }
        }
        if (targetMoods == null || targetMoods.isEmpty()) {
            return 50.0;
        }

        Set<String> userKeywords = new HashSet<>();
        for (Mood m : targetMoods) {
            userKeywords.addAll(getKeywordsForMood(m));
        }

        Set<String> destKeywords = extractKeywords(dest.getName(), dest.getDescription());
        if (userKeywords.isEmpty() || destKeywords.isEmpty()) {
            return 20.0;
        }

        Set<String> intersection = new HashSet<>(userKeywords);
        intersection.retainAll(destKeywords);

        Set<String> union = new HashSet<>(userKeywords);
        union.addAll(destKeywords);

        double similarity = (double) intersection.size() / union.size();
        return 20.0 + (similarity * 80.0);
    }

    private Set<String> getKeywordsForMood(Mood mood) {
        Set<String> keywords = new HashSet<>();
        switch (mood) {
            case RELAXED:
                keywords.addAll(List.of("relax", "relaxation", "beach", "calm", "resort", "quiet", "spa", "scenic", "slow", "peaceful", "serene", "nature", "chill"));
                break;
            case ADVENTUROUS:
                keywords.addAll(List.of("adventure", "hike", "climb", "explore", "wild", "trek", "trekking", "sports", "active", "mountain", "rafting", "outdoor", "wilderness", "energetic"));
                break;
            case ROMANTIC:
                keywords.addAll(List.of("romantic", "sunset", "candlelight", "view", "couple", "quiet", "luxury", "private", "honeymoon", "scenic"));
                break;
            case SOCIAL:
                keywords.addAll(List.of("social", "crowd", "party", "event", "nightlife", "bar", "club", "gathering", "tour", "group"));
                break;
            case SPIRITUAL:
                keywords.addAll(List.of("spiritual", "temple", "church", "mosque", "shrine", "peaceful", "calm", "silent", "yoga", "meditation"));
                break;
            case CURIOUS:
                keywords.addAll(List.of("curious", "museum", "history", "art", "heritage", "learning", "science", "exhibit", "culture", "cultural"));
                break;
            case CELEBRATORY:
                keywords.addAll(List.of("celebratory", "festival", "party", "holiday", "feast", "special", "event", "fun", "music", "concert"));
                break;
            case PEACEFUL:
                keywords.addAll(List.of("peaceful", "quiet", "calm", "silent", "serene", "nature", "forest", "lake", "park"));
                break;
            case FOOD_FOCUSED:
                keywords.addAll(List.of("food", "culinary", "restaurant", "eat", "dining", "cafe", "tasting", "cooking", "local", "market"));
                break;
            case NATURE_FOCUSED:
                keywords.addAll(List.of("nature", "forest", "mountain", "lake", "river", "park", "wildlife", "scenic", "trail", "green", "woods"));
                break;
            case ENERGETIC:
                keywords.addAll(List.of("energetic", "sports", "active", "run", "gym", "fitness", "hike", "theme", "park", "adventure"));
                break;
            case ESCAPE_FROM_STRESS:
                keywords.addAll(List.of("escape", "stress", "relax", "quiet", "private", "remote", "hideaway", "calm", "peaceful", "serene"));
                break;
            default:
                keywords.add(mood.name().toLowerCase());
                break;
        }
        return keywords;
    }

    private Set<String> extractKeywords(String name, String description) {
        Set<String> keywords = new HashSet<>();
        if (name != null) {
            for (String word : name.toLowerCase().split("[^a-zA-Z]+")) {
                if (word.length() > 2) keywords.add(word);
            }
        }
        if (description != null) {
            for (String word : description.toLowerCase().split("[^a-zA-Z]+")) {
                if (word.length() > 2) keywords.add(word);
            }
        }
        return keywords;
    }

    private double calculateInterestScore(Trip trip, Destination dest) {
        Set<Interest> interests = trip.getInterests();
        if (interests == null || interests.isEmpty()) {
            return 50.0;
        }
        
        long matches = 0;
        if (dest.getActivities() != null && !dest.getActivities().isEmpty()) {
            for (Activity act : dest.getActivities()) {
                if (act.getCategory() != null) {
                    try {
                        Interest actInterest = Interest.valueOf(act.getCategory().toUpperCase());
                        if (interests.contains(actInterest)) {
                            matches++;
                        }
                    } catch (Exception ignored) {}
                }
            }
            double ratio = (double) matches / dest.getActivities().size();
            return 20.0 + (ratio * 80.0);
        }
        return 20.0;
    }

    private double calculateBudgetScore(Trip trip, Destination dest) {
        if (trip.getPerPersonBudget() == null || dest.getAverageDailyCost() == null) {
            return 50.0;
        }
        
        double estimatedCost = dest.getAverageDailyCost() * trip.getNumberOfDays();
        double budget = trip.getPerPersonBudget().doubleValue();
        
        if (estimatedCost <= budget) {
            return 100.0;
        }
        
        double ratio = estimatedCost / budget;
        if (ratio < 1.1) return 80.0;
        if (ratio < 1.25) return 50.0;
        return 10.0;
    }

    private double calculateGroupCompatibilityScore(Trip trip, Destination dest) {
        TravellerType type = trip.getTravellerType();
        if (type == null) {
            return 50.0;
        }
        
        String desc = dest.getDescription() != null ? dest.getDescription().toLowerCase() : "";
        double baseline = 70.0;

        if (type == TravellerType.FAMILY || type == TravellerType.PARENTS_WITH_CHILDREN || (trip.getNumberOfChildren() != null && trip.getNumberOfChildren() > 0)) {
            if (desc.contains("family") || desc.contains("kids") || desc.contains("safe") || desc.contains("playground")) {
                baseline = 90.0;
            } else {
                baseline = 60.0;
            }
        } else if (type == TravellerType.COUPLE) {
            if (desc.contains("romantic") || desc.contains("scenic") || desc.contains("couple") || desc.contains("view")) {
                baseline = 90.0;
            } else {
                baseline = 60.0;
            }
        }

        if ((trip.getNumberOfElderly() != null && trip.getNumberOfElderly() > 0) || (trip.getAccessibilityRequirements() != null && !trip.getAccessibilityRequirements().trim().isEmpty())) {
            if (desc.contains("accessible") || desc.contains("elevator") || desc.contains("easy") || desc.contains("flat")) {
                baseline = Math.min(100.0, baseline + 10.0);
            } else {
                baseline = Math.max(30.0, baseline - 20.0);
            }
        }
        
        return baseline;
    }

    private double calculateRatingScore(Destination dest) {
        if (dest.getAverageRating() == null) {
            return 50.0;
        }
        return (dest.getAverageRating() / 5.0) * 100.0;
    }

    private Coordinate resolveStartingLocation(String startingLocation) {
        if (startingLocation == null || startingLocation.trim().isEmpty()) {
            return null;
        }
        String normalized = startingLocation.trim().toLowerCase();
        for (Map.Entry<String, Coordinate> entry : CITIES_COORDINATES.entrySet()) {
            if (normalized.contains(entry.getKey())) {
                return entry.getValue();
            }
        }
        return null;
    }

    private double calculateHaversineDistanceKm(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // Earth radius in km
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    private double calculateDistanceScore(Trip trip, Destination dest) {
        if (dest.getLatitude() == null || dest.getLongitude() == null) {
            return 50.0;
        }
        Coordinate start = resolveStartingLocation(trip.getStartingLocation());
        if (start == null) {
            return 50.0;
        }

        double distanceKm = calculateHaversineDistanceKm(start.latitude, start.longitude, dest.getLatitude(), dest.getLongitude());
        Double maxAllowedDistance = trip.getMaximumTravelDistance();
        if (maxAllowedDistance == null || maxAllowedDistance <= 0) {
            return 80.0;
        }

        if (distanceKm <= maxAllowedDistance) {
            double ratio = distanceKm / maxAllowedDistance;
            return 100.0 - (ratio * 40.0);
        } else {
            double excessRatio = (distanceKm - maxAllowedDistance) / maxAllowedDistance;
            double score = 60.0 - (excessRatio * 50.0);
            return Math.max(10.0, score);
        }
    }

    private double calculateProfileScore(Trip trip, UserTravelProfile profile) {
        if (profile == null) {
            return 50.0;
        }
        double score = 70.0;
        if (profile.getPreferredTravelPace() != null && profile.getPreferredTravelPace() == trip.getTravelPace()) {
            score += 15.0;
        }
        if (profile.getPreferredTransport() != null && trip.getPreferredTransport() != null 
                && profile.getPreferredTransport().equalsIgnoreCase(trip.getPreferredTransport())) {
            score += 15.0;
        }
        return Math.min(100.0, score);
    }

    private double calculatePaceCompatibilityScore(Trip trip, Destination dest) {
        TravelPace pace = trip.getTravelPace();
        if (pace == null) {
            return 50.0;
        }

        List<Activity> activities = dest.getActivities();
        if (activities == null || activities.isEmpty()) {
            return 50.0;
        }

        int lowCount = 0;
        int medCount = 0;
        int highCount = 0;

        for (Activity act : activities) {
            String energy = act.getEnergyLevel();
            if (energy == null) continue;
            energy = energy.trim().toLowerCase();
            if (energy.contains("low") || energy.contains("relaxed")) {
                lowCount++;
            } else if (energy.contains("high") || energy.contains("active") || energy.contains("packed")) {
                highCount++;
            } else {
                medCount++;
            }
        }

        int total = lowCount + medCount + highCount;
        if (total == 0) return 50.0;

        double score = 50.0;
        double lowRatio = (double) lowCount / total;
        double medRatio = (double) medCount / total;
        double highRatio = (double) highCount / total;

        switch (pace) {
            case RELAXED:
                score = 20.0 + (lowRatio * 80.0) + (medRatio * 40.0) - (highRatio * 30.0);
                break;
            case PACKED:
                score = 20.0 + (highRatio * 80.0) + (medRatio * 40.0) - (lowRatio * 30.0);
                break;
            case BALANCED:
                score = 20.0 + (medRatio * 80.0) + ((1.0 - Math.abs(lowRatio - highRatio)) * 40.0);
                break;
        }

        return Math.max(0.0, Math.min(100.0, score));
    }
}
