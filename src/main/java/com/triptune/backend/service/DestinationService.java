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
                .country(request.getCountry())
                .description(request.getDescription())
                .imageUrl(request.getImageUrl())
                .budgetLevel(request.getBudgetLevel())
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
        destination.setCountry(request.getCountry());
        destination.setDescription(request.getDescription());
        destination.setImageUrl(request.getImageUrl());
        destination.setBudgetLevel(request.getBudgetLevel());

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
                .country(destination.getCountry())
                .description(destination.getDescription())
                .imageUrl(destination.getImageUrl())
                .budgetLevel(destination.getBudgetLevel())
                .createdAt(destination.getCreatedAt())
                .updatedAt(destination.getUpdatedAt())
                .build();
    }
}
