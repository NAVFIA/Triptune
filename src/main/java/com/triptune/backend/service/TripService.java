package com.triptune.backend.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.temporal.ChronoUnit;
import java.util.stream.Collectors;

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
import com.triptune.backend.enums.BudgetFlexibility;
import com.triptune.backend.enums.TripStatus;
import com.triptune.backend.repository.DestinationRepository;
import com.triptune.backend.repository.TripRepository;
import com.triptune.backend.repository.UserRepository;

@Service
public class TripService {

    private final TripRepository tripRepository;
    private final UserRepository userRepository;
    private final DestinationRepository destinationRepository;

    public TripService(TripRepository tripRepository, UserRepository userRepository, DestinationRepository destinationRepository) {
        this.tripRepository = tripRepository;
        this.userRepository = userRepository;
        this.destinationRepository = destinationRepository;
    }

    private User getAuthenticatedUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Authenticated user not found"));
    }

    @Transactional
    public TripResponse createTripForCurrentUser(TripCreateRequest request) {
        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new IllegalArgumentException("End date cannot be before start date");
        }

        User user = getAuthenticatedUser();
        
        int numberOfDays = (int) ChronoUnit.DAYS.between(request.getStartDate(), request.getEndDate()) + 1;
        
        BigDecimal totalBudget = request.getTotalBudget();
        BigDecimal perPersonBudget = request.getPerPersonBudget();
        
        int travellers = request.getNumberOfTravellers();

        if (totalBudget == null && perPersonBudget != null) {
            totalBudget = perPersonBudget.multiply(BigDecimal.valueOf(travellers));
        } else if (perPersonBudget == null && totalBudget != null) {
            perPersonBudget = totalBudget.divide(BigDecimal.valueOf(travellers), 2, RoundingMode.HALF_UP);
        }

        Integer numberOfAdults = request.getNumberOfAdults() != null
                ? request.getNumberOfAdults()
                : travellers;
        Integer numberOfChildren = request.getNumberOfChildren() != null
                ? request.getNumberOfChildren()
                : 0;
        Integer numberOfElderly = request.getNumberOfElderly() != null
                ? request.getNumberOfElderly()
                : 0;
        BudgetFlexibility budgetFlexibility = request.getBudgetFlexibility() != null
                ? request.getBudgetFlexibility()
                : BudgetFlexibility.STRICT;

        Trip trip = Trip.builder()
                .createdBy(user)
                .tripName(request.getTripName())
                .startingLocation(request.getStartingLocation())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .numberOfDays(numberOfDays)
                .numberOfTravellers(travellers)
                .numberOfAdults(numberOfAdults)
                .numberOfChildren(numberOfChildren)
                .numberOfElderly(numberOfElderly)
                .travellerType(request.getTravellerType())
                .travelPace(request.getTravelPace())
                .moods(request.getMoods())
                .interests(request.getInterests())
                .totalBudget(totalBudget)
                .perPersonBudget(perPersonBudget)
                .budgetFlexibility(budgetFlexibility)
                .preferredTransport(request.getPreferredTransport())
                .maximumTravelDistance(request.getMaximumTravelDistance())
                .dietaryPreferences(request.getDietaryPreferences())
                .accessibilityRequirements(request.getAccessibilityRequirements())
                .activitiesToAvoid(request.getActivitiesToAvoid())
                .preferredWakeUpTime(request.getPreferredWakeUpTime())
                .preferredSleepTime(request.getPreferredSleepTime())
                .crowdTolerance(request.getCrowdTolerance())
                .maximumWalkingDistance(request.getMaximumWalkingDistance())
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
        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new IllegalArgumentException("End date cannot be before start date");
        }
        
        User user = getAuthenticatedUser();
        Trip trip = tripRepository.findByIdAndCreatedById(tripId, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Trip not found or you do not have permission to access it"));

        int numberOfDays = (int) ChronoUnit.DAYS.between(request.getStartDate(), request.getEndDate()) + 1;
        
        BigDecimal totalBudget = request.getTotalBudget();
        BigDecimal perPersonBudget = request.getPerPersonBudget();
        int travellers = request.getNumberOfTravellers() != null ? request.getNumberOfTravellers() : 1;

        if (totalBudget == null && perPersonBudget != null) {
            totalBudget = perPersonBudget.multiply(BigDecimal.valueOf(travellers));
        } else if (perPersonBudget == null && totalBudget != null) {
            perPersonBudget = totalBudget.divide(BigDecimal.valueOf(travellers), 2, RoundingMode.HALF_UP);
        } else if (totalBudget == null && perPersonBudget == null) {
            throw new IllegalArgumentException("Either totalBudget or perPersonBudget must be provided");
        }

        trip.setTripName(request.getTripName());
        trip.setStartingLocation(request.getStartingLocation());
        trip.setStartDate(request.getStartDate());
        trip.setEndDate(request.getEndDate());
        trip.setNumberOfDays(numberOfDays);
        trip.setNumberOfTravellers(request.getNumberOfTravellers());
        trip.setNumberOfAdults(request.getNumberOfAdults());
        trip.setNumberOfChildren(request.getNumberOfChildren());
        trip.setNumberOfElderly(request.getNumberOfElderly());
        trip.setTravellerType(request.getTravellerType());
        trip.setTravelPace(request.getTravelPace());
        trip.setMoods(request.getMoods());
        trip.setInterests(request.getInterests());
        trip.setTotalBudget(totalBudget);
        trip.setPerPersonBudget(perPersonBudget);
        trip.setBudgetFlexibility(request.getBudgetFlexibility());
        trip.setPreferredTransport(request.getPreferredTransport());
        trip.setMaximumTravelDistance(request.getMaximumTravelDistance());
        trip.setDietaryPreferences(request.getDietaryPreferences());
        trip.setAccessibilityRequirements(request.getAccessibilityRequirements());
        trip.setActivitiesToAvoid(request.getActivitiesToAvoid());
        trip.setPreferredWakeUpTime(request.getPreferredWakeUpTime());
        trip.setPreferredSleepTime(request.getPreferredSleepTime());
        trip.setCrowdTolerance(request.getCrowdTolerance());
        trip.setMaximumWalkingDistance(request.getMaximumWalkingDistance());

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
        
        Trip updatedTrip = tripRepository.save(trip);
        return mapToResponse(updatedTrip);
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
