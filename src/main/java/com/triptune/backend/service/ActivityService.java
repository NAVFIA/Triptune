package com.triptune.backend.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.triptune.backend.dto.activity.ActivityRequest;
import com.triptune.backend.dto.activity.ActivityResponse;
import com.triptune.backend.entity.Activity;
import com.triptune.backend.entity.Destination;
import com.triptune.backend.repository.ActivityRepository;
import com.triptune.backend.repository.DestinationRepository;

@Service
public class ActivityService {

    private final ActivityRepository activityRepository;
    private final DestinationRepository destinationRepository;

    public ActivityService(ActivityRepository activityRepository, DestinationRepository destinationRepository) {
        this.activityRepository = activityRepository;
        this.destinationRepository = destinationRepository;
    }

    public ActivityResponse createActivity(Long destinationId, ActivityRequest request) {
        Destination destination = destinationRepository.findById(destinationId)
                .orElseThrow(() -> new IllegalArgumentException("Destination not found with id: " + destinationId));

        Activity activity = Activity.builder()
                .destination(destination)
                .name(request.getName())
                .description(request.getDescription())
                .category(request.getCategory())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .estimatedCost(request.getEstimatedCost())
                .durationMinutes(request.getDurationMinutes())
                .openingTime(request.getOpeningTime())
                .closingTime(request.getClosingTime())
                .energyLevel(request.getEnergyLevel())
                .indoor(request.getIndoor() != null ? request.getIndoor() : false)
                .weatherDependent(request.getWeatherDependent() != null ? request.getWeatherDependent() : false)
                .bookingRequired(request.getBookingRequired() != null ? request.getBookingRequired() : false)
                .rating(request.getRating())
                .imageUrl(request.getImageUrl())
                .active(request.getActive() != null ? request.getActive() : true)
                .build();

        Activity savedActivity = activityRepository.save(activity);
        return mapToResponse(savedActivity);
    }

    public List<ActivityResponse> getActivitiesByDestination(Long destinationId) {
        Destination destination = destinationRepository.findById(destinationId)
                .orElseThrow(() -> new IllegalArgumentException("Destination not found with id: " + destinationId));

        return destination.getActivities().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public ActivityResponse getActivityById(Long id) {
        Activity activity = activityRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Activity not found with id: " + id));
        return mapToResponse(activity);
    }

    public ActivityResponse updateActivity(Long id, ActivityRequest request) {
        Activity activity = activityRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Activity not found with id: " + id));

        activity.setName(request.getName());
        activity.setDescription(request.getDescription());
        activity.setCategory(request.getCategory());
        activity.setLatitude(request.getLatitude());
        activity.setLongitude(request.getLongitude());
        activity.setEstimatedCost(request.getEstimatedCost());
        activity.setDurationMinutes(request.getDurationMinutes());
        activity.setOpeningTime(request.getOpeningTime());
        activity.setClosingTime(request.getClosingTime());
        activity.setEnergyLevel(request.getEnergyLevel());
        if (request.getIndoor() != null) activity.setIndoor(request.getIndoor());
        if (request.getWeatherDependent() != null) activity.setWeatherDependent(request.getWeatherDependent());
        if (request.getBookingRequired() != null) activity.setBookingRequired(request.getBookingRequired());
        activity.setRating(request.getRating());
        activity.setImageUrl(request.getImageUrl());
        if (request.getActive() != null) activity.setActive(request.getActive());

        Activity updatedActivity = activityRepository.save(activity);
        return mapToResponse(updatedActivity);
    }

    public void deleteActivity(Long id) {
        Activity activity = activityRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Activity not found with id: " + id));
        
        // Soft delete
        activity.setActive(false);
        activityRepository.save(activity);
    }

    private ActivityResponse mapToResponse(Activity activity) {
        return ActivityResponse.builder()
                .id(activity.getId())
                .destinationId(activity.getDestination().getId())
                .name(activity.getName())
                .description(activity.getDescription())
                .category(activity.getCategory())
                .latitude(activity.getLatitude())
                .longitude(activity.getLongitude())
                .estimatedCost(activity.getEstimatedCost())
                .durationMinutes(activity.getDurationMinutes())
                .openingTime(activity.getOpeningTime())
                .closingTime(activity.getClosingTime())
                .energyLevel(activity.getEnergyLevel())
                .indoor(activity.getIndoor())
                .weatherDependent(activity.getWeatherDependent())
                .bookingRequired(activity.getBookingRequired())
                .rating(activity.getRating())
                .imageUrl(activity.getImageUrl())
                .active(activity.getActive())
                .createdAt(activity.getCreatedAt())
                .updatedAt(activity.getUpdatedAt())
                .build();
    }
}
