package com.triptune.backend.service;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.triptune.backend.dto.profile.UserTravelProfileRequest;
import com.triptune.backend.dto.profile.UserTravelProfileResponse;
import com.triptune.backend.entity.User;
import com.triptune.backend.entity.UserTravelProfile;
import com.triptune.backend.repository.UserRepository;
import com.triptune.backend.repository.UserTravelProfileRepository;

@Service
public class UserTravelProfileService {

    private final UserTravelProfileRepository profileRepository;
    private final UserRepository userRepository;

    public UserTravelProfileService(UserTravelProfileRepository profileRepository, UserRepository userRepository) {
        this.profileRepository = profileRepository;
        this.userRepository = userRepository;
    }

    private User getAuthenticatedUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Authenticated user not found"));
    }

    @Transactional
    public UserTravelProfileResponse createProfileForCurrentUser(UserTravelProfileRequest request) {
        User user = getAuthenticatedUser();

        if (profileRepository.existsByUserId(user.getId())) {
            throw new IllegalArgumentException("Profile already exists for this user");
        }

        UserTravelProfile profile = UserTravelProfile.builder()
                .user(user)
                .preferredMoods(request.getPreferredMoods())
                .interests(request.getInterests())
                .defaultTravellerType(request.getDefaultTravellerType())
                .preferredTravelPace(request.getPreferredTravelPace())
                .preferredTransport(request.getPreferredTransport())
                .maximumTravelDistance(request.getMaximumTravelDistance())
                .crowdTolerance(request.getCrowdTolerance())
                .maximumWalkingDistance(request.getMaximumWalkingDistance())
                .dietaryPreferences(request.getDietaryPreferences())
                .accessibilityRequirements(request.getAccessibilityRequirements())
                .preferredWakeUpTime(request.getPreferredWakeUpTime())
                .preferredSleepTime(request.getPreferredSleepTime())
                .build();

        UserTravelProfile savedProfile = profileRepository.save(profile);
        return mapToResponse(savedProfile);
    }

    public UserTravelProfileResponse getCurrentUserProfile() {
        User user = getAuthenticatedUser();
        UserTravelProfile profile = profileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Profile not found for current user"));
        return mapToResponse(profile);
    }

    @Transactional
    public UserTravelProfileResponse updateCurrentUserProfile(UserTravelProfileRequest request) {
        User user = getAuthenticatedUser();
        UserTravelProfile profile = profileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Profile not found for current user"));

        profile.setPreferredMoods(request.getPreferredMoods());
        profile.setInterests(request.getInterests());
        profile.setDefaultTravellerType(request.getDefaultTravellerType());
        profile.setPreferredTravelPace(request.getPreferredTravelPace());
        profile.setPreferredTransport(request.getPreferredTransport());
        profile.setMaximumTravelDistance(request.getMaximumTravelDistance());
        profile.setCrowdTolerance(request.getCrowdTolerance());
        profile.setMaximumWalkingDistance(request.getMaximumWalkingDistance());
        profile.setDietaryPreferences(request.getDietaryPreferences());
        profile.setAccessibilityRequirements(request.getAccessibilityRequirements());
        profile.setPreferredWakeUpTime(request.getPreferredWakeUpTime());
        profile.setPreferredSleepTime(request.getPreferredSleepTime());

        UserTravelProfile updatedProfile = profileRepository.save(profile);
        return mapToResponse(updatedProfile);
    }

    @Transactional
    public void deleteCurrentUserProfile() {
        User user = getAuthenticatedUser();
        UserTravelProfile profile = profileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Profile not found for current user"));
        profileRepository.delete(profile);
    }

    private UserTravelProfileResponse mapToResponse(UserTravelProfile profile) {
        return UserTravelProfileResponse.builder()
                .profileId(profile.getId())
                .userId(profile.getUser().getId())
                .userFullName(profile.getUser().getFullName())
                .userEmail(profile.getUser().getEmail())
                .preferredMoods(profile.getPreferredMoods())
                .interests(profile.getInterests())
                .defaultTravellerType(profile.getDefaultTravellerType())
                .preferredTravelPace(profile.getPreferredTravelPace())
                .preferredTransport(profile.getPreferredTransport())
                .maximumTravelDistance(profile.getMaximumTravelDistance())
                .crowdTolerance(profile.getCrowdTolerance())
                .maximumWalkingDistance(profile.getMaximumWalkingDistance())
                .dietaryPreferences(profile.getDietaryPreferences())
                .accessibilityRequirements(profile.getAccessibilityRequirements())
                .preferredWakeUpTime(profile.getPreferredWakeUpTime())
                .preferredSleepTime(profile.getPreferredSleepTime())
                .createdAt(profile.getCreatedAt())
                .updatedAt(profile.getUpdatedAt())
                .build();
    }
}
