package com.triptune.backend.controller;

import java.util.List;

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
import com.triptune.backend.dto.destination.DestinationRequest;
import com.triptune.backend.dto.destination.DestinationResponse;
import com.triptune.backend.service.DestinationService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/destinations")
public class DestinationController {

    private final DestinationService destinationService;

    public DestinationController(DestinationService destinationService) {
        this.destinationService = destinationService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<DestinationResponse>> createDestination(@Valid @RequestBody DestinationRequest request) {
        DestinationResponse response = destinationService.createDestination(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Destination created successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<DestinationResponse>>> getAllDestinations() {
        List<DestinationResponse> response = destinationService.getAllDestinations();
        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.success("Destinations retrieved successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DestinationResponse>> getDestinationById(@PathVariable Long id) {
        DestinationResponse response = destinationService.getDestinationById(id);
        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.success("Destination retrieved successfully", response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<DestinationResponse>> updateDestination(
            @PathVariable Long id,
            @Valid @RequestBody DestinationRequest request
    ) {
        DestinationResponse response = destinationService.updateDestination(id, request);
        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.success("Destination updated successfully", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteDestination(@PathVariable Long id) {
        destinationService.deleteDestination(id);
        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.success("Destination deleted successfully", null));
    }
}
