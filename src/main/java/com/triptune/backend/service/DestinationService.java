package com.triptune.backend.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.triptune.backend.dto.destination.DestinationRequest;
import com.triptune.backend.dto.destination.DestinationResponse;
import com.triptune.backend.entity.Destination;
import com.triptune.backend.repository.DestinationRepository;

@Service
public class DestinationService {

    private final DestinationRepository destinationRepository;

    public DestinationService(DestinationRepository destinationRepository) {
        this.destinationRepository = destinationRepository;
    }

    @Transactional
    public DestinationResponse createDestination(DestinationRequest request) {
        if (destinationRepository.existsByName(request.getName())) {
            throw new IllegalArgumentException("Destination already exists with name: " + request.getName());
        }

        Destination destination = Destination.builder()
                .name(request.getName())
                .state(request.getState())
                .country(request.getCountry())
                .description(request.getDescription())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .averageDailyCost(request.getAverageDailyCost())
                .minimumRecommendedDays(request.getMinimumRecommendedDays())
                .maximumRecommendedDays(request.getMaximumRecommendedDays())
                .averageRating(request.getAverageRating())
                .imageUrl(request.getImageUrl())
                .bestSeason(request.getBestSeason())
                .active(request.getActive() != null ? request.getActive() : true)
                .build();

        Destination savedDestination = destinationRepository.save(destination);
        return mapToResponse(savedDestination);
    }

    @Transactional(readOnly = true)
    public List<DestinationResponse> getAllDestinations() {
        return destinationRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DestinationResponse getDestinationById(Long id) {
        Destination destination = destinationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Destination not found with id: " + id));
        return mapToResponse(destination);
    }

    @Transactional
    public DestinationResponse updateDestination(Long id, DestinationRequest request) {
        Destination destination = destinationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Destination not found with id: " + id));

        if (!destination.getName().equalsIgnoreCase(request.getName()) && destinationRepository.existsByName(request.getName())) {
            throw new IllegalArgumentException("Destination already exists with name: " + request.getName());
        }

        destination.setName(request.getName());
        destination.setState(request.getState());
        destination.setCountry(request.getCountry());
        destination.setDescription(request.getDescription());
        destination.setLatitude(request.getLatitude());
        destination.setLongitude(request.getLongitude());
        destination.setAverageDailyCost(request.getAverageDailyCost());
        destination.setMinimumRecommendedDays(request.getMinimumRecommendedDays());
        destination.setMaximumRecommendedDays(request.getMaximumRecommendedDays());
        destination.setAverageRating(request.getAverageRating());
        destination.setImageUrl(request.getImageUrl());
        destination.setBestSeason(request.getBestSeason());
        if (request.getActive() != null) {
            destination.setActive(request.getActive());
        }

        Destination updatedDestination = destinationRepository.save(destination);
        return mapToResponse(updatedDestination);
    }

    @Transactional
    public void deleteDestination(Long id) {
        if (!destinationRepository.existsById(id)) {
            throw new IllegalArgumentException("Destination not found with id: " + id);
        }
        destinationRepository.deleteById(id);
    }

    private DestinationResponse mapToResponse(Destination destination) {
        return DestinationResponse.builder()
                .id(destination.getId())
                .name(destination.getName())
                .state(destination.getState())
                .country(destination.getCountry())
                .description(destination.getDescription())
                .latitude(destination.getLatitude())
                .longitude(destination.getLongitude())
                .averageDailyCost(destination.getAverageDailyCost())
                .minimumRecommendedDays(destination.getMinimumRecommendedDays())
                .maximumRecommendedDays(destination.getMaximumRecommendedDays())
                .averageRating(destination.getAverageRating())
                .imageUrl(destination.getImageUrl())
                .bestSeason(destination.getBestSeason())
                .active(destination.getActive())
                .createdAt(destination.getCreatedAt())
                .updatedAt(destination.getUpdatedAt())
                .build();
    }
}
