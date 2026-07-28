package com.triptune.backend.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.triptune.backend.dto.ApiResponse;
import com.triptune.backend.dto.trip.TripCreateRequest;
import com.triptune.backend.dto.trip.TripResponse;
import com.triptune.backend.dto.trip.TripUpdateRequest;
import com.triptune.backend.service.TripService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/trips")
public class TripController {

    private final TripService tripService;

    public TripController(TripService tripService) {
        this.tripService = tripService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TripResponse>> createTrip(@Valid @RequestBody TripCreateRequest request) {
        TripResponse response = tripService.createTripForCurrentUser(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Trip created successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<TripResponse>>> getTrips(Pageable pageable) {
        Page<TripResponse> response = tripService.getTripsForCurrentUser(pageable);
        return ResponseEntity.ok(ApiResponse.success("Trips retrieved successfully", response));
    }

    @GetMapping("/{tripId}")
    public ResponseEntity<ApiResponse<TripResponse>> getTrip(@PathVariable Long tripId) {
        TripResponse response = tripService.getTripByIdForCurrentUser(tripId);
        return ResponseEntity.ok(ApiResponse.success("Trip retrieved successfully", response));
    }

    @PutMapping("/{tripId}")
    public ResponseEntity<ApiResponse<TripResponse>> updateTrip(
            @PathVariable Long tripId,
            @Valid @RequestBody TripUpdateRequest request) {
        TripResponse response = tripService.updateTripForCurrentUser(tripId, request);
        return ResponseEntity.ok(ApiResponse.success("Trip updated successfully", response));
    }

    @DeleteMapping("/{tripId}")
    public ResponseEntity<ApiResponse<Void>> deleteTrip(@PathVariable Long tripId) {
        tripService.deleteTripForCurrentUser(tripId);
        return ResponseEntity.ok(ApiResponse.success("Trip deleted successfully", null));
    }

    @PostMapping("/{tripId}/select-destination/{destinationId}")
    public ResponseEntity<ApiResponse<TripResponse>> selectDestination(
            @PathVariable Long tripId,
            @PathVariable Long destinationId) {
        TripResponse response = tripService.selectDestinationForTrip(tripId, destinationId);
        return ResponseEntity.ok(ApiResponse.success("Destination selected successfully", response));
    }

    @GetMapping("/{tripId}/destination-recommendations")
    public ResponseEntity<ApiResponse<java.util.List<com.triptune.backend.dto.recommendation.DestinationRecommendationResponse>>> getDestinationRecommendations(
            @PathVariable Long tripId, 
            @org.springframework.beans.factory.annotation.Autowired com.triptune.backend.service.DestinationRecommendationService recommendationService) {
        java.util.List<com.triptune.backend.dto.recommendation.DestinationRecommendationResponse> recommendations = recommendationService.recommendDestinationsForTrip(tripId);
        return ResponseEntity.ok(ApiResponse.success("Recommendations generated successfully", recommendations));
    }
}
