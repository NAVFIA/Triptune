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
import com.triptune.backend.dto.activity.ActivityRequest;
import com.triptune.backend.dto.activity.ActivityResponse;
import com.triptune.backend.service.ActivityService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1")
public class ActivityController {

    private final ActivityService activityService;

    public ActivityController(ActivityService activityService) {
        this.activityService = activityService;
    }

    @PostMapping("/destinations/{destinationId}/activities")
    public ResponseEntity<ApiResponse<ActivityResponse>> createActivity(
            @PathVariable Long destinationId,
            @Valid @RequestBody ActivityRequest request
    ) {
        ActivityResponse response = activityService.createActivity(destinationId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Activity created successfully", response));
    }

    @GetMapping("/destinations/{destinationId}/activities")
    public ResponseEntity<ApiResponse<List<ActivityResponse>>> getActivitiesByDestination(
            @PathVariable Long destinationId
    ) {
        List<ActivityResponse> response = activityService.getActivitiesByDestination(destinationId);
        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.success("Activities retrieved successfully", response));
    }

    @GetMapping("/activities/{id}")
    public ResponseEntity<ApiResponse<ActivityResponse>> getActivityById(@PathVariable Long id) {
        ActivityResponse response = activityService.getActivityById(id);
        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.success("Activity retrieved successfully", response));
    }

    @PutMapping("/activities/{id}")
    public ResponseEntity<ApiResponse<ActivityResponse>> updateActivity(
            @PathVariable Long id,
            @Valid @RequestBody ActivityRequest request
    ) {
        ActivityResponse response = activityService.updateActivity(id, request);
        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.success("Activity updated successfully", response));
    }

    @DeleteMapping("/activities/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteActivity(@PathVariable Long id) {
        activityService.deleteActivity(id);
        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.success("Activity deleted successfully", null));
    }
}
