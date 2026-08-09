package com.triptune.backend.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.triptune.backend.dto.destination.DestinationResponse;
import com.triptune.backend.dto.trip.TripCreateRequest;
import com.triptune.backend.dto.trip.TripResponse;
import com.triptune.backend.dto.trip.TripUpdateRequest;
import com.triptune.backend.entity.Destination;
import com.triptune.backend.entity.Trip;
import com.triptune.backend.entity.User;
import com.triptune.backend.enums.TripStatus;
import com.triptune.backend.repository.DestinationRepository;
import com.triptune.backend.repository.TripRepository;
import com.triptune.backend.repository.UserRepository;

@Service
public class TripService {

    private final TripRepository tripRepository;
    private final UserRepository userRepository;
    private final DestinationRepository destinationRepository;
    private final DestinationRecommendationService recommendationService;

    public TripService(TripRepository tripRepository, UserRepository userRepository, DestinationRepository destinationRepository, DestinationRecommendationService recommendationService) {
        this.tripRepository = tripRepository;
        this.userRepository = userRepository;
        this.destinationRepository = destinationRepository;
        this.recommendationService = recommendationService;
    }

    private User getAuthenticatedUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Authenticated user not found"));
    }

    @Transactional
    public TripResponse createTripForCurrentUser(TripCreateRequest request) {
        User user = getAuthenticatedUser();
        
        Trip trip = Trip.builder()
                .createdBy(user)
                .tripName(request.getTripName())
                .startingLocation(request.getStartingLocation())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .numberOfDays(java.time.Period.between(request.getStartDate(), request.getEndDate()).getDays() + 1)
                .numberOfTravellers(request.getNumberOfTravellers())
                .numberOfAdults(request.getNumberOfAdults())
                .numberOfChildren(request.getNumberOfChildren())
                .numberOfElderly(request.getNumberOfElderly())
                .travellerType(request.getTravellerType())
                .travelPace(request.getTravelPace())
                .moods(request.getMoods() != null ? new java.util.HashSet<>(request.getMoods()) : null)
                .interests(request.getInterests() != null ? new java.util.HashSet<>(request.getInterests()) : null)
                .perPersonBudget(request.getPerPersonBudget())
                .totalBudget(request.getPerPersonBudget().multiply(BigDecimal.valueOf(request.getNumberOfTravellers())))
                .preferredTransport(request.getPreferredTransport())
                .maximumTravelDistance(request.getMaximumTravelDistance())
                .crowdTolerance(request.getCrowdTolerance())
                .maximumWalkingDistance(request.getMaximumWalkingDistance())
                .budgetFlexibility(request.getBudgetFlexibility())
                .status(TripStatus.DRAFT)
                .build();
                
        Trip savedTrip = tripRepository.save(trip);
        return mapToResponse(savedTrip);
    }

    @Transactional(readOnly = true)
    public Page<TripResponse> getTripsForCurrentUser(Pageable pageable) {
        User user = getAuthenticatedUser();
        return tripRepository.findByCreatedById(user.getId(), pageable)
                .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public TripResponse getTripByIdForCurrentUser(Long tripId) {
        User user = getAuthenticatedUser();
        Trip trip = tripRepository.findByIdAndCreatedById(tripId, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Trip not found or you do not have permission to access it"));
        return mapToResponse(trip);
    }

    @Transactional
    public TripResponse updateTripForCurrentUser(Long tripId, TripUpdateRequest request) {
        User user = getAuthenticatedUser();
        Trip trip = tripRepository.findByIdAndCreatedById(tripId, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Trip not found or you do not have permission to access it"));
                
        trip.setTripName(request.getTripName());
        trip.setStartingLocation(request.getStartingLocation());
        trip.setStartDate(request.getStartDate());
        trip.setEndDate(request.getEndDate());
        trip.setNumberOfDays(java.time.Period.between(request.getStartDate(), request.getEndDate()).getDays() + 1);
        trip.setNumberOfTravellers(request.getNumberOfTravellers());
        trip.setNumberOfAdults(request.getNumberOfAdults());
        trip.setNumberOfChildren(request.getNumberOfChildren());
        trip.setNumberOfElderly(request.getNumberOfElderly());
        trip.setTravellerType(request.getTravellerType());
        trip.setTravelPace(request.getTravelPace());
        trip.setMoods(request.getMoods() != null ? new java.util.HashSet<>(request.getMoods()) : null);
        trip.setInterests(request.getInterests() != null ? new java.util.HashSet<>(request.getInterests()) : null);
        BigDecimal perPerson = request.getPerPersonBudget() != null ? request.getPerPersonBudget() : trip.getPerPersonBudget();
        Integer numTravellers = request.getNumberOfTravellers() != null ? request.getNumberOfTravellers() : trip.getNumberOfTravellers();
        if (numTravellers == null) numTravellers = 1;
        trip.setPerPersonBudget(perPerson);
        if (perPerson != null) {
            trip.setTotalBudget(perPerson.multiply(BigDecimal.valueOf(numTravellers)));
        }
        trip.setPreferredTransport(request.getPreferredTransport());
        trip.setMaximumTravelDistance(request.getMaximumTravelDistance());
        trip.setDietaryPreferences(request.getDietaryPreferences());
        trip.setAccessibilityRequirements(request.getAccessibilityRequirements());
        trip.setActivitiesToAvoid(request.getActivitiesToAvoid());
        trip.setPreferredWakeUpTime(request.getPreferredWakeUpTime());
        trip.setPreferredSleepTime(request.getPreferredSleepTime());
        trip.setCrowdTolerance(request.getCrowdTolerance());
        trip.setMaximumWalkingDistance(request.getMaximumWalkingDistance());
        trip.setBudgetFlexibility(request.getBudgetFlexibility());
        
        Trip updatedTrip = tripRepository.save(trip);
        return mapToResponse(updatedTrip);
    }

    @Transactional
    public void deleteTripForCurrentUser(Long tripId) {
        User user = getAuthenticatedUser();
        Trip trip = tripRepository.findByIdAndCreatedById(tripId, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Trip not found or you do not have permission to access it"));
        tripRepository.delete(trip);
    }

    @Transactional
    public TripResponse selectDestinationForTrip(Long tripId, Long destinationId) {
        User user = getAuthenticatedUser();
        Trip trip = tripRepository.findByIdAndCreatedById(tripId, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Trip not found or you do not have permission to access it"));
        
        Destination destination = destinationRepository.findById(destinationId)
                .orElseThrow(() -> new IllegalArgumentException("Destination not found"));
                
        trip.setSelectedDestination(destination);
        trip.setStatus(TripStatus.DESTINATION_SELECTED);
        
        // Log selection behavior to train the Weka Random Forest model
        recommendationService.recordInteraction(trip, destinationId);
        
        Trip updatedTrip = tripRepository.save(trip);
        return mapToResponse(updatedTrip);
    }

    @Transactional
    public TripResponse confirmTrip(Long tripId) {
        User user = getAuthenticatedUser();
        Trip trip = tripRepository.findByIdAndCreatedById(tripId, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Trip not found or you do not have permission to access it"));

        if (trip.getSelectedDestination() == null) {
            throw new IllegalArgumentException("Cannot confirm trip without selecting a destination");
        }

        trip.setStatus(TripStatus.CONFIRMED);
        Trip saved = tripRepository.save(trip);
        return mapToResponse(saved);
    }

    private TripResponse mapToResponse(Trip trip) {
        DestinationResponse destResponse = null;
        if (trip.getSelectedDestination() != null) {
            Destination d = trip.getSelectedDestination();
            destResponse = DestinationResponse.builder()
                    .id(d.getId())
                    .name(d.getName())
                    .state(d.getState())
                    .country(d.getCountry())
                    .description(d.getDescription())
                    .imageUrl(d.getImageUrl())
                    .averageDailyCost(d.getAverageDailyCost())
                    .bestSeason(d.getBestSeason())
                    .averageRating(d.getAverageRating())
                    .active(d.getActive())
                    .createdAt(d.getCreatedAt())
                    .updatedAt(d.getUpdatedAt())
                    .build();
        }

        return TripResponse.builder()
                .tripId(trip.getId())
                .creatorUserId(trip.getCreatedBy().getId())
                .creatorFullName(trip.getCreatedBy().getFullName())
                .tripName(trip.getTripName())
                .startingLocation(trip.getStartingLocation())
                .startDate(trip.getStartDate())
                .endDate(trip.getEndDate())
                .numberOfDays(trip.getNumberOfDays())
                .numberOfTravellers(trip.getNumberOfTravellers())
                .numberOfAdults(trip.getNumberOfAdults())
                .numberOfChildren(trip.getNumberOfChildren())
                .numberOfElderly(trip.getNumberOfElderly())
                .travellerType(trip.getTravellerType())
                .travelPace(trip.getTravelPace())
                .moods(trip.getMoods() != null ? new java.util.HashSet<>(trip.getMoods()) : null)
                .interests(trip.getInterests() != null ? new java.util.HashSet<>(trip.getInterests()) : null)
                .totalBudget(trip.getTotalBudget())
                .perPersonBudget(trip.getPerPersonBudget())
                .budgetFlexibility(trip.getBudgetFlexibility())
                .preferredTransport(trip.getPreferredTransport())
                .maximumTravelDistance(trip.getMaximumTravelDistance())
                .dietaryPreferences(trip.getDietaryPreferences())
                .accessibilityRequirements(trip.getAccessibilityRequirements())
                .activitiesToAvoid(trip.getActivitiesToAvoid())
                .preferredWakeUpTime(trip.getPreferredWakeUpTime())
                .preferredSleepTime(trip.getPreferredSleepTime())
                .crowdTolerance(trip.getCrowdTolerance())
                .maximumWalkingDistance(trip.getMaximumWalkingDistance())
                .selectedDestination(destResponse)
                .status(trip.getStatus())
                .createdAt(trip.getCreatedAt())
                .updatedAt(trip.getUpdatedAt())
                .build();
    }
}
