package com.triptune.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.triptune.backend.dto.ApiResponse;
import com.triptune.backend.dto.itinerary.ItineraryResponse;
import com.triptune.backend.service.ItineraryService;

@RestController
@RequestMapping("/api/v1/trips")
public class ItineraryController {

    private final ItineraryService itineraryService;

    public ItineraryController(ItineraryService itineraryService) {
        this.itineraryService = itineraryService;
    }

    @GetMapping("/{tripId}/itinerary")
    public ResponseEntity<ApiResponse<ItineraryResponse>> getTripItinerary(@PathVariable Long tripId) {
        ItineraryResponse response = itineraryService.generateItinerary(tripId);
        return ResponseEntity.ok(ApiResponse.success("Itinerary generated successfully", response));
    }

    @PostMapping("/{tripId}/itinerary/reject/{activityId}")
    public ResponseEntity<ApiResponse<ItineraryResponse>> rejectActivity(
            @PathVariable Long tripId,
            @PathVariable Long activityId) {
        ItineraryResponse response = itineraryService.rejectActivity(tripId, activityId);
        return ResponseEntity.ok(ApiResponse.success("Activity replaced successfully", response));
    }
}
