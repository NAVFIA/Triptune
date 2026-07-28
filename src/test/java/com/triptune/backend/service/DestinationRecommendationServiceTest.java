package com.triptune.backend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import com.triptune.backend.dto.recommendation.DestinationRecommendationResponse;
import com.triptune.backend.entity.Destination;
import com.triptune.backend.entity.Trip;
import com.triptune.backend.entity.User;
import com.triptune.backend.repository.DestinationRepository;
import com.triptune.backend.repository.TripRepository;
import com.triptune.backend.repository.UserRepository;
import com.triptune.backend.repository.UserTravelProfileRepository;

@ExtendWith(MockitoExtension.class)
public class DestinationRecommendationServiceTest {

    @Mock
    private TripRepository tripRepository;

    @Mock
    private DestinationRepository destinationRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserTravelProfileRepository profileRepository;

    @InjectMocks
    private DestinationRecommendationService recommendationService;

    private User mockUser;

    @BeforeEach
    public void setup() {
        mockUser = User.builder().id(1L).email("test@example.com").fullName("Test User").build();
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("test@example.com", "password")
        );
    }

    @Test
    public void testRecommendationReturnsSortedResultsAndExcludesInactive() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(mockUser));
        
        Trip mockTrip = Trip.builder()
                .id(100L)
                .createdBy(mockUser)
                .numberOfDays(5)
                .perPersonBudget(new BigDecimal("1000"))
                .build();
                
        when(tripRepository.findByIdAndCreatedById(100L, 1L)).thenReturn(Optional.of(mockTrip));
        when(profileRepository.findByUserId(1L)).thenReturn(Optional.empty());

        Destination d1 = Destination.builder().id(1L).name("Dest1").active(true).averageDailyCost(200.0).averageRating(4.5).build();
        Destination d2 = Destination.builder().id(2L).name("Dest2").active(true).averageDailyCost(100.0).averageRating(4.8).build();
        Destination d3 = Destination.builder().id(3L).name("Dest3").active(false).averageDailyCost(150.0).build(); // Inactive
        
        when(destinationRepository.findAll()).thenReturn(Arrays.asList(d1, d2, d3));
        when(tripRepository.save(any())).thenReturn(mockTrip);

        List<DestinationRecommendationResponse> results = recommendationService.recommendDestinationsForTrip(100L);
        
        assertNotNull(results);
        assertEquals(2, results.size()); // Excludes inactive
        
        // Dest2 is cheaper and higher rated, should be first
        assertEquals(2L, results.get(0).getDestinationId());
        assertEquals(1L, results.get(1).getDestinationId());
        
        assertTrue(results.get(0).getOverallScore() >= results.get(1).getOverallScore());
    }

    @Test
    public void testRecommendationRespectsBudget() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(mockUser));
        
        Trip mockTrip = Trip.builder()
                .id(100L)
                .createdBy(mockUser)
                .numberOfDays(5)
                .perPersonBudget(new BigDecimal("500")) // Max 500
                .build();
                
        when(tripRepository.findByIdAndCreatedById(100L, 1L)).thenReturn(Optional.of(mockTrip));
        when(profileRepository.findByUserId(1L)).thenReturn(Optional.empty());

        Destination cheap = Destination.builder().id(1L).name("Cheap").active(true).averageDailyCost(80.0).build(); // 400 total
        Destination expensive = Destination.builder().id(2L).name("Expensive").active(true).averageDailyCost(300.0).build(); // 1500 total
        
        when(destinationRepository.findAll()).thenReturn(Arrays.asList(cheap, expensive));
        when(tripRepository.save(any())).thenReturn(mockTrip);

        List<DestinationRecommendationResponse> results = recommendationService.recommendDestinationsForTrip(100L);
        
        assertEquals(2, results.size());
        
        DestinationRecommendationResponse cheapRec = results.stream().filter(r -> r.getDestinationId() == 1L).findFirst().get();
        DestinationRecommendationResponse expRec = results.stream().filter(r -> r.getDestinationId() == 2L).findFirst().get();
        
        // Budget score should be higher for cheap
        assertTrue(cheapRec.getBudgetMatchScore() > expRec.getBudgetMatchScore());
        // Expensive should have risk listed
        assertFalse(expRec.getPossibleRisks().isEmpty());
    }

    private void assertTrue(boolean condition) {
        if (!condition) throw new AssertionError();
    }
}
