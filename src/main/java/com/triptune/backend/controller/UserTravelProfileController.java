package com.triptune.backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.triptune.backend.dto.ApiResponse;
import com.triptune.backend.dto.profile.UserTravelProfileRequest;
import com.triptune.backend.dto.profile.UserTravelProfileResponse;
import com.triptune.backend.service.UserTravelProfileService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/profile")
public class UserTravelProfileController {

    private final UserTravelProfileService profileService;

    public UserTravelProfileController(UserTravelProfileService profileService) {
        this.profileService = profileService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<UserTravelProfileResponse>> createProfile(
            @Valid @RequestBody UserTravelProfileRequest request
    ) {
        UserTravelProfileResponse response = profileService.createProfileForCurrentUser(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Profile created successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<UserTravelProfileResponse>> getProfile() {
        UserTravelProfileResponse response = profileService.getCurrentUserProfile();
        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.success("Profile retrieved successfully", response));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<UserTravelProfileResponse>> updateProfile(
            @Valid @RequestBody UserTravelProfileRequest request
    ) {
        UserTravelProfileResponse response = profileService.updateCurrentUserProfile(request);
        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.success("Profile updated successfully", response));
    }

    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> deleteProfile() {
        profileService.deleteCurrentUserProfile();
        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.success("Profile deleted successfully", null));
    }
}
