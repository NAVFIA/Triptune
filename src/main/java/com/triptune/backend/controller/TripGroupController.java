package com.triptune.backend.controller;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.triptune.backend.dto.ApiResponse;
import com.triptune.backend.dto.group.InviteMemberRequest;
import com.triptune.backend.dto.group.TripExpenseCreateRequest;
import com.triptune.backend.dto.group.TripPhotoCreateRequest;
import com.triptune.backend.dto.group.ExpenseSplitResponse;
import com.triptune.backend.entity.TripExpense;
import com.triptune.backend.entity.TripPhoto;
import com.triptune.backend.entity.User;
import com.triptune.backend.repository.UserRepository;
import com.triptune.backend.service.TripGroupService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/trips/{tripId}")
public class TripGroupController {

    private final TripGroupService tripGroupService;
    private final UserRepository userRepository;

    public TripGroupController(TripGroupService tripGroupService, UserRepository userRepository) {
        this.tripGroupService = tripGroupService;
        this.userRepository = userRepository;
    }

    private User getAuthenticatedUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Authenticated user not found"));
    }

    @PostMapping("/members")
    public ResponseEntity<ApiResponse<Void>> inviteMember(
            @PathVariable Long tripId,
            @Valid @RequestBody InviteMemberRequest request) {
        User currentUser = getAuthenticatedUser();
        tripGroupService.inviteMember(tripId, request.getEmail(), currentUser);
        return ResponseEntity.ok(ApiResponse.success("Member invited successfully", null));
    }

    @GetMapping("/members")
    public ResponseEntity<ApiResponse<List<String>>> getMembers(@PathVariable Long tripId) {
        User currentUser = getAuthenticatedUser();
        Set<User> members = tripGroupService.getMembers(tripId, currentUser);
        List<String> emails = members.stream()
                .map(User::getEmail)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("Members retrieved successfully", emails));
    }

    @PostMapping("/photos")
    public ResponseEntity<ApiResponse<TripPhoto>> uploadPhoto(
            @PathVariable Long tripId,
            @Valid @RequestBody TripPhotoCreateRequest request) {
        User currentUser = getAuthenticatedUser();
        TripPhoto photo = tripGroupService.uploadPhoto(tripId, request, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Photo uploaded successfully", photo));
    }

    @GetMapping("/photos")
    public ResponseEntity<ApiResponse<List<TripPhoto>>> getPhotos(@PathVariable Long tripId) {
        User currentUser = getAuthenticatedUser();
        List<TripPhoto> photos = tripGroupService.getPhotos(tripId, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Photos retrieved successfully", photos));
    }

    @PostMapping("/expenses")
    public ResponseEntity<ApiResponse<TripExpense>> addExpense(
            @PathVariable Long tripId,
            @Valid @RequestBody TripExpenseCreateRequest request) {
        User currentUser = getAuthenticatedUser();
        TripExpense expense = tripGroupService.addExpense(tripId, request, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Expense logged successfully", expense));
    }

    @GetMapping("/expenses")
    public ResponseEntity<ApiResponse<List<TripExpense>>> getExpenses(@PathVariable Long tripId) {
        User currentUser = getAuthenticatedUser();
        List<TripExpense> expenses = tripGroupService.getExpenses(tripId, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Expenses retrieved successfully", expenses));
    }

    @GetMapping("/expenses/splits")
    public ResponseEntity<ApiResponse<List<ExpenseSplitResponse>>> getSplits(@PathVariable Long tripId) {
        User currentUser = getAuthenticatedUser();
        List<ExpenseSplitResponse> splits = tripGroupService.calculateSplits(tripId, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Expense splits calculated successfully", splits));
    }
}
